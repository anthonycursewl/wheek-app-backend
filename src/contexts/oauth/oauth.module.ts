import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Domain repositories
import { OAUTH_CLIENT_REPOSITORY } from './domain/repos/oauth-client.repository';
import { AUTHORIZATION_CODE_REPOSITORY } from './domain/repos/authorization-code.repository';
import { OAUTH_TOKEN_REPOSITORY } from './domain/repos/oauth-token.repository';
import { PARTNER_REPOSITORY } from './domain/repos/partner.repository';
import { PARTNER_LINK_SESSION_REPOSITORY } from './domain/repos/partner-link-session.repository';
import { PARTNER_LINKED_USER_REPOSITORY } from './domain/repos/partner-linked-user.repository';
import { USER_REPOSITORY } from '@users/domain/repos/user.repository';

// Infrastructure adapters
import { OAuthClientRepositoryAdapter } from './infrastructure/adapters/oauth-client.repository';
import { AuthorizationCodeRepositoryAdapter } from './infrastructure/adapters/authorization-code.repository';
import { OAuthTokenRepositoryAdapter } from './infrastructure/adapters/oauth-token.repository';
import { PartnerRepositoryAdapter } from './infrastructure/adapters/partner.repository';
import { PartnerLinkSessionRepositoryAdapter } from './infrastructure/adapters/partner-link-session.repository';
import { PartnerLinkedUserRepositoryAdapter } from './infrastructure/adapters/partner-linked-user.repository';
import { UserRepositoryAdapter } from '@users/infraestructure/adapters/user.repository';

// Controllers
import { OAuthController } from './infrastructure/controllers/oauth.controller';
import { UserInfoController } from './infrastructure/controllers/user-info.controller';
import { PartnerController } from './infrastructure/controllers/partner.controller';
import { OAuthLinkController } from './infrastructure/controllers/oauth-link.controller';
import { AdminPartnerController } from './infrastructure/controllers/admin-partner.controller';

// Use cases
import { AuthorizeUseCase } from './application/authorize.usecase';
import { TokenExchangeUseCase } from './application/token-exchange.usecase';
import { TokenRefreshUseCase } from './application/token-refresh.usecase';
import { TokenRevokeUseCase } from './application/token-revoke.usecase';
import { GetUserInfoUseCase } from './application/get-user-info.usecase';
import { LookupUserUseCase } from './application/lookup-user.usecase';
import { ProvisionUserUseCase } from './application/provision-user.usecase';
import { GetUserStatusUseCase } from './application/user-status.usecase';

// Guards
import { PartnerApiKeyGuard } from './infrastructure/guards/partner-api-key.guard';
import { OAuthScopeGuard } from './infrastructure/guards/oauth-scope.guard';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_ACCESS_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [
        OAuthController,
        UserInfoController,
        PartnerController,
        OAuthLinkController,
        AdminPartnerController,
    ],
    providers: [
        // Repository adapters
        {
            provide: OAUTH_CLIENT_REPOSITORY,
            useClass: OAuthClientRepositoryAdapter,
        },
        {
            provide: AUTHORIZATION_CODE_REPOSITORY,
            useClass: AuthorizationCodeRepositoryAdapter,
        },
        {
            provide: OAUTH_TOKEN_REPOSITORY,
            useClass: OAuthTokenRepositoryAdapter,
        },
        {
            provide: PARTNER_REPOSITORY,
            useClass: PartnerRepositoryAdapter,
        },
        {
            provide: PARTNER_LINK_SESSION_REPOSITORY,
            useClass: PartnerLinkSessionRepositoryAdapter,
        },
        {
            provide: PARTNER_LINKED_USER_REPOSITORY,
            useClass: PartnerLinkedUserRepositoryAdapter,
        },
        {
            provide: USER_REPOSITORY,
            useClass: UserRepositoryAdapter,
        },

        // Use cases
        AuthorizeUseCase,
        TokenExchangeUseCase,
        TokenRefreshUseCase,
        TokenRevokeUseCase,
        GetUserInfoUseCase,
        LookupUserUseCase,
        ProvisionUserUseCase,
        GetUserStatusUseCase,

        // Guards
        PartnerApiKeyGuard,
        OAuthScopeGuard,
    ],
    exports: [
        OAUTH_CLIENT_REPOSITORY,
        AUTHORIZATION_CODE_REPOSITORY,
        OAUTH_TOKEN_REPOSITORY,
        PARTNER_REPOSITORY,
        PARTNER_LINK_SESSION_REPOSITORY,
        PARTNER_LINKED_USER_REPOSITORY,
        PartnerApiKeyGuard,
        OAuthScopeGuard,
    ],
})
export class OAuthModule { }

