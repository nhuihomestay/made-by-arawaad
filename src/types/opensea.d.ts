declare interface Account {
    user?: { username: string };
    address: string;
}

declare interface AssetEventSale {
    id: number;
    quantity: number;
    seller: Account;
    winner_account: Account;
    asset: {
        id: number;
        token_id: string;
        image_url: string;
        name: string;
        permalink: string;
        collection: {
            name: string;
            image_url: string;
        };
    };
    total_price: any;
    payment_token: {
        symbol: string;
        usd_price: number;
        decimals: number;
    };
}

declare interface FetchEventsResponse {
    asset_events: AssetEventSale[];
}

declare interface FetchEventsInput {
    asset_contract_address?: string;
    limit: number;
    collection_slug?: string;
    event_type:
        | 'created'
        | 'successful'
        | 'cancelled'
        | 'bid_entered'
        | 'bid_withdrawn'
        | 'transfer'
        | 'approve';
}

declare interface Sale {
    id: number;
    asset_name: string;
    collection_name: string;
    price: {
        usd: string;
        native: number;
        currency: string;
    };
    icon: string;
    url: string;
    seller: {
        short: string;
        url: string;
    };
    buyer: {
        short: string;
        url: string;
    };
    image: string;
}
