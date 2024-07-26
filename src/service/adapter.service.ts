import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { CVSFileReportDto } from '@/core/dtos/files.dto';
import { CVSRepositoryDto } from '@/core/dtos/repository.dto';
import { CVSRepositoryWebhookDto } from '@/core/dtos/webhooks.dto';

@Injectable()
export class AdapterService {
    private readonly baseUrl: string = 'http://localhost:8542/adapters';

    constructor(private readonly httpService: HttpService) {}

    async getCvsRepositories(
        apiToken: string,
        adapterToken: string,
    ): Promise<CVSRepositoryDto[] | undefined> {
        try {
            const response: AxiosResponse<CVSRepositoryDto[]> = await lastValueFrom(
                this.httpService.get(`${this.baseUrl}/${adapterToken}/repositories`, {
                    headers: { API_TOKEN: apiToken },
                }),
            );

            return response.data;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch repositories');
        }
    }

    async getCvsRepositoryFiles(
        apiToken: string,
        adapterToken: string,
        owner: string,
        repo: string,
    ): Promise<CVSFileReportDto | undefined> {
        try {
            const response: AxiosResponse<CVSFileReportDto> = await lastValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/${adapterToken}/repositories/${owner}/${repo}/files`,
                    {
                        headers: { API_TOKEN: apiToken },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch repository files');
        }
    }

    async getCvsFileContent(
        apiToken: string,
        adapterToken: string,
        owner: string,
        repo: string,
        path: string,
    ): Promise<string | undefined> {
        try {
            const response: AxiosResponse<string> = await lastValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/${adapterToken}/repositories/${owner}/${repo}/files/content`,
                    {
                        headers: { API_TOKEN: apiToken },
                        params: { path },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            Logger.debug(`${error}`);
            return undefined;
        }
    }

    async getCvsRepositoryWebhooks(
        apiToken: string,
        adapterToken: string,
        owner: string,
        repo: string,
    ): Promise<CVSRepositoryWebhookDto[] | undefined> {
        try {
            const response: AxiosResponse<CVSRepositoryWebhookDto[]> = await lastValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/${adapterToken}/repositories/${owner}/${repo}/webhooks`,
                    {
                        headers: { API_TOKEN: apiToken },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            Logger.debug(`${error}`);
            return undefined;
        }
    }
}
