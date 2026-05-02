import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostcodeService {
  constructor() {}

  async getAllPostcode(postcode: string) {
    const postcodeRes = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
    );
    const postcodeData = await postcodeRes.json();

    if (postcodeData.status !== 200) {
      throw new NotFoundException(`Postcode "${postcode}" not found`);
    }

    const outcode = postcodeData.result.outcode;
    const outcodeRes = await fetch(
      `https://api.postcodes.io/outcodes/${encodeURIComponent(outcode)}`,
    );
    const outcodeData = await outcodeRes.json();

    if (outcodeData.status !== 200) {
      throw new NotFoundException(`Outcode "${outcode}" not found`);
    }

    const { admin_ward, admin_district, parish } = outcodeData.result;

    const locations = [
      ...new Set(
        [...(admin_ward ?? []), ...(admin_district ?? []), ...(parish ?? [])]
          .filter(Boolean)
          .sort(),
      ),
    ];

    return {
      postcode: postcodeData.result.postcode,
      locations,
      total: locations.length,
    };
  }
}
