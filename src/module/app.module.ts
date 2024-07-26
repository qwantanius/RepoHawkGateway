import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GraphqlModule } from '@/module/graphql.module';
import { RepositoryResolver } from '@/resolver/repository.resolver';
import { AdapterService } from '@/service/adapter.service';

@Module({
    imports: [
        GraphqlModule,
        HttpModule,
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
    ],
    controllers: [],
    providers: [AdapterService, RepositoryResolver],
})
export class AppModule {}
