
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostcodeService {
  private readonly IDEAL_API_KEY = process.env.IDEAL_POSTCODES_API_KEY;
  private readonly BASE_URL = 'https://api.ideal-postcodes.co.uk/v1';
  // "Bramble Lea, Main Road, Barnoldby-le-Beck, Grimsby, DN37 0BG"
  async getAddresses(postcode: string): Promise<{
    postcode: string;
    addresses: string[]
    total: number;
  }> {
    const clean = postcode.replace(/\s+/g, '').toUpperCase();

    const res = await fetch(
      `${this.BASE_URL}/postcodes/${encodeURIComponent(clean)}?api_key=${this.IDEAL_API_KEY}`,
    );

    if (res.status === 404) {
      throw new NotFoundException(`Postcode "${postcode}" not found`);
    }

    if (res.status === 401 || res.status === 402) {
      throw new NotFoundException(
        'Invalid or exhausted IDEAL_POSTCODES_API_KEY',
      );
    }

    if (!res.ok) {
      throw new NotFoundException(`Address lookup failed: ${res.status}`);
    }

    const data = await res.json();
    const results = data.result ?? [];

    // "Bramble Lea, Main Road, Barnoldby-le-Beck, Grimsby, DN37 0BG"
    const addresses: string[] = results.map((addr: any) => {
      const parts = [
        addr.line_1, // house name/number + street
        addr.line_2, // secondary street
        addr.line_3, // locality
        addr.post_town, // town/city
        addr.county, // county (if available)
        addr.postcode, // postcode
      ].filter((p: string) => p && p.trim() !== '');

      return parts.join(', ');
    });

    return {
      postcode: clean,
      addresses,
      total: addresses.length,
    };
  }

  // async autocompletePostcode(partial: string): Promise<{
  //   suggestions: string[];
  //   total: number;
  // }> {
  //   const res = await fetch(
  //     `https://api.postcodes.io/postcodes/${encodeURIComponent(partial)}/autocomplete`,
  //   );
  //   const data = await res.json();

  //   if (data.status !== 200 || !data.result) {
  //     return { suggestions: [], total: 0 };
  //   }

  //   return {
  //     suggestions: data.result ?? [],
  //     total: data.result?.length ?? 0,
  //   };
  // }

  // async validatePostcode(postcode: string): Promise<{
  //   valid: boolean;
  //   postcode?: string;
  //   region?: string;
  //   country?: string;
  //   latitude?: number;
  //   longitude?: number;
  // }> {
  //   const res = await fetch(
  //     `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
  //   );
  //   const data = await res.json();

  //   if (data.status !== 200) {
  //     return { valid: false };
  //   }

  //   const r = data.result;
  //   return {
  //     valid: true,
  //     postcode: r.postcode,
  //     region: r.region,
  //     country: r.country,
  //     latitude: r.latitude,
  //     longitude: r.longitude,
  //   };
  // }
}
