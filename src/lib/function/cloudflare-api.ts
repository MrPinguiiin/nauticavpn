import { config } from "$lib/variable";
import { BAD_WORDS_LIST } from "$lib/variable";

/**
 * Class untuk berinteraksi dengan Cloudflare API
 */
export class CloudflareApi {
  private bearer: string;
  private accountID: string;
  private zoneID: string;
  private apiEmail: string;
  private apiKey: string;
  private headers: Record<string, string>;

  /**
   * Constructor untuk CloudflareApi
   */
  constructor() {
    this.apiKey = config.cloudflare.apiKey;
    this.bearer = `Bearer ${this.apiKey}`;
    this.accountID = config.cloudflare.accountID;
    this.zoneID = config.cloudflare.zoneID;
    this.apiEmail = config.cloudflare.apiEmail;

    this.headers = {
      Authorization: this.bearer,
      "X-Auth-Email": this.apiEmail,
      "X-Auth-Key": this.apiKey,
    };
  }

  /**
   * Mendapatkan daftar domain terdaftar
   */
  async getDomainList(): Promise<string[]> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, {
      headers: {
        ...this.headers,
      },
    });

    if (res.status === 200) {
      const respJson = await res.json();
      return respJson.result
        .filter((data: any) => data.service === config.serviceName)
        .map((data: any) => data.hostname);
    }

    return [];
  }

  /**
   * Mendaftarkan domain baru
   * @param domain Domain yang akan didaftarkan
   * @returns HTTP status code
   */
  async registerDomain(domain: string): Promise<number> {
    domain = domain.toLowerCase();
    const registeredDomains = await this.getDomainList();
    const appDomain = `${config.serviceName}.${config.rootDomain}`;

    if (!domain.endsWith(config.rootDomain)) return 400;
    if (registeredDomains.includes(domain)) return 409;

    try {
      const domainTest = await fetch(`https://${domain.replaceAll("." + appDomain, "")}`);
      if (domainTest.status === 530) return domainTest.status;

      const badWordsListRes = await fetch(BAD_WORDS_LIST);
      if (badWordsListRes.status === 200) {
        const badWordsList = (await badWordsListRes.text()).split("\n");
        for (const badWord of badWordsList) {
          if (domain.includes(badWord.toLowerCase())) {
            return 403;
          }
        }
      } else {
        return 403;
      }
    } catch (e) {
      return 400;
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        environment: "production",
        hostname: domain,
        service: config.serviceName,
        zone_id: this.zoneID,
      }),
      headers: {
        ...this.headers,
      },
    });

    return res.status;
  }
} 