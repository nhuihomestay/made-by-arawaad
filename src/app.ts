import axios from 'axios';
import storage from 'node-persist'

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1166201790929313822/rGs5dlPD_i3aokSi0WTQ-cPGkOhn6U0kA8y898wBmW93k3tVrIccChy0Cz7mlvcPa2mm';
const API_KEY = '44925ba2f1a5443ab726473e1a35dd22';

const notified: number[] = [];

(async () => {
    await storage.init();

    console.log('Initialized...');

    const keys = await storage.keys();

    for (const key of keys) {
        notified.push(Number(key));
    }
})()

const cacheEvent = async (id: any) => {
    await storage.setItem(id.toString(), true);
    notified.push(id);
};

const openzee = axios.create({
    baseURL: 'https://api.opensea.io/api/v1',
    headers: {
        Accept: 'application/json',
        'X-API-KEY': API_KEY,
    },
});

const shortenAddress = (address: string): string =>
    address.replace(address.slice(4, 38), '...');

async function sendSaleEmbed(sale: Sale) {
    const payload = {
        embeds: [
            {
                title: `${sale.asset_name} was purchased!`,
                url: sale.url,
                color: 5814783,
                fields: [
                    {
                        name: 'Sale Price',
                        value: `${sale.price.native} ${sale.price.currency}`,
                    },
                    ...(!sale.price.currency.includes('USD')
                        ? [
                            {
                                name: 'Sale Price USD',
                                value: `$${sale.price.usd}`,
                            },
                        ]
                        : []),
                    {
                        name: 'Buyer',
                        value: `[${sale.buyer.short}](${sale.buyer.url})`,
                        inline: true,
                    },
                    {
                        name: 'Seller',
                        value: `[${sale.seller.short}](${sale.seller.url})`,
                        inline: true,
                    },
                ],
                footer: {
                    text: sale.collection_name,
                    icon_url: sale.icon,
                },
                timestamp: new Date().toJSON(),
                thumbnail: {
                    url: sale.image,
                },
            },
        ],
    };
    console.log(JSON.stringify(payload, null, 4));
    axios.post(WEBHOOK_URL, payload);
}

export async function fetchEvents(params: FetchEventsInput): Promise<void> {
    const {
        data: { asset_events },
    } = await openzee.get<FetchEventsResponse>('/events', { params });

    for (const event of asset_events) {
        if (notified.includes(event.id)) continue;

        const tokensNative =
            event.total_price / Number(1 + '0'.repeat(event.payment_token.decimals));

        const sale: Sale = {
            id: event.asset.id,
            asset_name: event.asset.name,
            collection_name: event.asset.collection.name,
            image: event.asset.image_url,
            url: event.asset.permalink,
            icon: event.asset.collection.image_url,
            seller: {
                short:
                    event.seller.user?.username ?? shortenAddress(event.seller.address),
                url: `https://opensea.io/${event.seller.address}`,
            },
            buyer: {
                short:
                    event.winner_account.user?.username ??
                    shortenAddress(event.winner_account.address),
                url: `https://opensea.io/${event.winner_account.address}`,
            },
            price: {
                usd: Math.floor(
                    tokensNative * event.payment_token.usd_price
                ).toLocaleString('en-US'),
                native: tokensNative,
                currency: event.payment_token.symbol,
            },
        };
        console.log(event);
        await cacheEvent(event.id);
        sendSaleEmbed(sale);
    }
}

export function initialize(params: FetchEventsInput) {
    setInterval(function () {
        fetchEvents(params);
    }, 100 * 60);
}