import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RepositoryOwner {
    @Field()
    login: string;

    @Field()
    id: number;
}

@ObjectType()
export class Repository {
    @Field()
    id!: number;

    @Field()
    name!: string;

    @Field()
    totalSize!: string;

    @Field()
    owner!: RepositoryOwner;

    @Field()
    isPrivate!: boolean;

    @Field()
    numberOfFiles!: number;

    @Field(() => String, { nullable: true })
    ymlFileName: string | null = null;

    @Field(() => String, { nullable: true })
    ymlFileContent: string | null = null;

    @Field(() => [String])
    activeWebhooks!: string[];
}
