import { setTimeout } from 'node:timers/promises';

import { ConfigService } from '@nestjs/config';
import { Resolver, Query, Args } from '@nestjs/graphql';

import { AdapterService } from '@/service/adapter.service';
import { Repository } from '@/type/repository.type';

@Resolver(() => Repository)
export class RepositoryResolver {
    constructor(
        private readonly adapterService: AdapterService,
        private readonly configService: ConfigService,
    ) {}

    @Query(() => [Repository])
    async repositoryDetails(
        @Args('apiToken') apiToken: string,
        @Args('adapterToken') adapterToken: string,
    ): Promise<Repository[]> {
        try {
            const cvsRepositories = await this.adapterService.getCvsRepositories(
                apiToken,
                adapterToken,
            );

            if (!cvsRepositories) {
                throw new Error('Failed to fetch repositories');
            }

            const resolvedRepoDetails = await Promise.all(
                cvsRepositories.map(async (repo) => {
                    // TODO: should be done with RabbitMQ or whatever else queing thing
                    await setTimeout(parseInt('REQUEST_DELAY_MILLIS', 10));

                    const owner: string | undefined = repo.owner.login;
                    const repoName: string | undefined = repo.name;

                    if (!repoName || !owner || !repo?.id) {
                        throw new Error(`Repo name or owner are not defined`);
                    }

                    const { files, ymlFileContent, webhooks, ymlFile } =
                        await this.fetchRepositoryDetails(apiToken, adapterToken, owner, repoName);

                    return {
                        id: repo.id,
                        name: repo.name,
                        totalSize: files?.totalSize || 'N/A',
                        owner: {
                            login: repo.owner.login,
                            id: repo.owner.id,
                        },
                        isPrivate: repo.private,
                        numberOfFiles: files?.numberOfFiles || 0,
                        ymlFileName: ymlFile?.name || null,
                        ymlFileContent: ymlFileContent || null,
                        activeWebhooks: webhooks?.map((wh) => wh.name) || [],
                    };
                }),
            );

            return resolvedRepoDetails;
        } catch (error) {
            console.error('Error fetching repository details:', error);
            throw new Error('Failed to fetch repository details');
        }
    }

    private async fetchRepositoryDetails(
        apiToken: string,
        adapterToken: string,
        owner: string,
        repoName: string,
    ) {
        const [webhooks, files] = await Promise.all([
            this.adapterService.getCvsRepositoryWebhooks(apiToken, adapterToken, owner, repoName),
            this.adapterService.getCvsRepositoryFiles(apiToken, adapterToken, owner, repoName),
        ]);

        const ymlFile = files?.files.find((file) => file.path.endsWith('.yml'));

        const ymlFileContent =
            ymlFile &&
            (await this.adapterService.getCvsFileContent(
                apiToken,
                adapterToken,
                owner,
                repoName,
                ymlFile.path,
            ));

        return { webhooks, files, ymlFileContent, ymlFile };
    }
}
