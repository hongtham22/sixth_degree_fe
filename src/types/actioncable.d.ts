declare module '@rails/actioncable' {
  export interface Subscription {
    unsubscribe(): void;
    perform(action: string, data?: any): void;
  }

  export interface Subscriptions {
    create(params: { channel: string }, callbacks: {
      connected?: () => void;
      disconnected?: () => void;
      rejected?: () => void;
      received?: (data: any) => void;
    }): Subscription;
  }

  export interface Consumer {
    subscriptions: Subscriptions;
    disconnect(): void;
  }

  export function createConsumer(url?: string): Consumer;
}

