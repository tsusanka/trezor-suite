import { AbstractMetadataProvider } from '@suite-types/metadata';

class UserDataProvider extends AbstractMetadataProvider {
    constructor() {
        super('userData');
        console.warn('UserDataProvider');
    }

    async connect() {
        // todo: maybe perform check if can read/write to fs?
        return true;
    }

    async disconnect() {
        return true;
    }

    // @ts-ignore not implemeneted yet
    async getCredentials() {
        // todo: does not make sense
        return this.ok({
            type: this.type,
            token: '123',
            user: 'me',
        });
    }

    async getFileContent(file: string) {
        // @ts-ignore !todo
        const result = await window.desktopApi!.invoke('metadata/read', { file: `${file}.mtdt` });
        console.warn('result', result);
        if (!result.success) {
            return this.error('PROVIDER_ERROR', result.error);
        }
        if (!result.payload) {
            return this.ok(undefined);
        }
        return this.ok(Buffer.from(result.payload, 'hex'));
    }

    async setFileContent(file: string, content: Buffer) {
        const hex = content.toString('hex');

        // @ts-ignore todo!
        const result = await window.desktopApi!.invoke('metadata/save', {
            file: `${file}.mtdt`,
            content: hex,
        });
        if (!result.success) {
            return this.error('PROVIDER_ERROR', result.error);
        }

        return this.ok(undefined);
    }

    // @ts-ignore
    isConnected() {
        return true;
    }
}

export default UserDataProvider;
