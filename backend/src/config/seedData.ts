import { database } from './database';
import { SavedLocation } from '../types';

interface SeedTrip {
  name: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  days: Array<{
    dayNumber: number;
    locations: Array<{
      name: string;
      address: string;
      placeId: string;
      lat: number;
      lng: number;
      type: string;
      openingHours?: string | null;
      photoUrl?: string | null;
    }>;
  }>;
}

const SEED_TRIPS: SeedTrip[] = [
  {
    name: 'Paris',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    coverImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987',
    days: [
      {
        dayNumber: 2,
        locations: [
          {
            name: '美第奇噴泉',
            address: 'Rue de Médicis, 75006 Paris, 法國',
            placeId: 'ChIJVXo3ktxx5kcRfG9kB3YF1mc',
            lat: 48.84806669999999685,
            lng: 2.339307999999999943,
            type: 'attraction',
            openingHours: '星期一: 07:30 – 19:15',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU4KBw0o_MoazD78TPZSQ7iFYkXjbjRABAtJsFMSKMdusYDTB5CE2XSUmAlt4xk2R4rTnPNLUMXnG2ts5McaPqvRm_nJpmw39q0M_8HOzwE3wuDkEcHbuinfWiN4iUknK1-IAkJCAqZdQRnNvswgqxv1mEGfGTtyDpqN_SgvwMYkWmYjdnI7tYa7-OBtW_XJP2IUl4jRdquG0Amfyib7AVroXc4ibGdHXQrwwwqdEN6olqYpMB6Sbr9GnuxVd8JddwatP3l2oGUfddzkUmP5qbR5Y7MAFYX6sH7Fatqe_0-ZPmsgqJiXYdZ73ST9HPiHzPP9OpU0qgS6XGr7ZLP531CB1e2fAn34_ih6I5A2XctbdPtHi8il4WXRWyPm7MEQrn0h7R3SSm15Ts1HR2ZimLGqMhHmSaHJdmwZhlsDjKPlO77B&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: 'Les Deux Magots',
            address: '6 Pl. Saint-Germain des Prés, 75006 Paris, 法國',
            placeId: 'ChIJLeslLNhx5kcRtkpSU9ZmNvo',
            lat: 48.85405200000000291,
            lng: 2.333106200000000018,
            type: 'attraction',
            openingHours: '星期一: 00:30 – 01:00, 07:30 – 00:00',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU7Gpes5c6Dkjm77cRAUMgmPxjzS0Zaa5A1kk9FUBUCNxECqJLpoSm1AZIx0TCZItU4KF8wXV_f6C8dqSMrQo8erjNd41AXiazORJpLlxO3E9TLu1GCYBGnGkqVxaB7B7U9trk2XT1jA4A9DPf1wxhpIuKP70z_g4gf1cjvRKWvw4PjI3cE5UxPdEuCE1PM8AUXzpqR7tSHcOpcLYwsdf7MDyVlkQgXubPJEjGMIccqfVKMz-Y4dEh91Exb7EK5PZj_Cc6Gl2BiAdxnAbu8YoZG278u5ax56Y2sExYXgPTj04Q&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: 'Café de Flore',
            address: '172 Bd Saint-Germain, 75006 Paris, France',
            placeId: 'ChIJd8BlQ2BZwokRAFQEcDlJRAI3',
            lat: 48.85419999999999874,
            lng: 2.330799999999999983,
            type: 'cafe',
            openingHours: '07:00-01:30',
            photoUrl: null,
          },
          {
            name: '巴黎聖母院',
            address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, 法國',
            placeId: 'ChIJATr1n-Fx5kcRjQb6q6cdQDY',
            lat: 48.85296820000000651,
            lng: 2.349902099999999994,
            type: 'attraction',
            openingHours: '星期一: 07:50 – 19:00, 星期二: 07:50 – 19:00, 星期三: 07:50 – 19:00, 星期四: 07:50 – 22:00, 星期五: 07:50 – 19:00, 星期六: 08:15 – 19:30, 星期日: 08:15 – 19:30',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU6nH3nUqCKMB-edtUqkw_V5GyZqYHmfqSuy4NNv3GAXGfu9MuaMq60zli2uOwdyrCin9x5uRnCpD7yGHYjrVJrT69wQVv-zjpdG8rlEk6nDevfcwty3hMjY3i0GYPPZfyV4JTQCYZA6L6DcP4FObhcAhugCpuK7Nxo34L7ezUr_nh_jODvShE6N1IBHZjLMF9VqzAkMKip48_CJiD7bxev01d9CiiR2YPnWdIj_5uEOIlkeIBL7FZtMqzextKFlwIK3QM1cEsTAiarqLefSS9SmdQPZrVfYvvyvRcBvNWudZsamqXRVGBuJKYZcHudtsJY9TXaMUjOucuFx0WV8WrQ5y82GzK38Z_EgVxnGeG-Kcof_sbR6ix4jO03TKA1842PPmjD7B3ytYd1Kx7C0jSKpSwP9C0N4L3fOywLfltl9ug&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: '巴黎歌劇院',
            address: 'Pl. de l\'Opéra, 75009 Paris, 法國',
            placeId: 'ChIJOYNm1DBu5kcRZwdtKBzyq6k',
            lat: 48.87196970000000106,
            lng: 2.331601399999999825,
            type: 'attraction',
            openingHours: null,
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU5tkndJyub8S37csbN-h6r9q8krqQEwqs6FjRGZ8-dEAbVJe4seTVl6kTuvohxFqSyucfF85zoPtYrRz1uFILhjIgDKLtlRpGWDYgE-KR_mhj6noxj68G9GmWG1pT2yJwwsXw6ryheKPvGM8m73UqYdaYLSqUJc1HIXbUBWj4oUqhYMQ4-A_8DLRc4NXZwajHxforR6xwQsSfrTDSsXDjYz9mLhr0tjKflVt2MWeLTmEglKWQ9vJRBYsLBdyCEOFul4B4YAHkTPzAvpPvmlYkBNjw5VgpMQ5d2KxKvOliWmySiiD_Cp7Xz9xAbOhizTq11OyXVz_LtB2hyTNVZDeQmin5Mo9mz81pJbAkzD89Y70_cUB6FS4kbor9FrvF6Guds55G63-jbLG_Z2hrQdJ5tl546I8jIMRTnm26OHIVRUlRY4&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: 'Resto Hua',
            address: '6 Rue Michel Peter, 75013 Paris, 法國',
            placeId: 'ChIJ7--BiThx5kcRpdzIB3ewyOo',
            lat: 48.8366868000000025,
            lng: 2.353225999999999818,
            type: 'restaurant',
            openingHours: '星期一: 12:00 – 15:00, 18:00 – 22:00',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU5gmgFmaBB7lJpViBpv8OC8NtrZoFYpEwKEHtufNr8FcliZAlMz4ybjBd_xVcAms6a8ebN7jOXaA627CVaNSdpgMpyayjAYXLThedHFQbxmXckP-XBotfXWMO-h-Du_5Q9X3AjLImZgcTJpwuQCkFfP8932oXSubMth4DdnwxpmBQblpiYSklkJ3lbd1oMFZPRSwGqu3vAW-ly4dbt3WyL05E_g6OL9K0uhUk1NfuIByZe7Ajns2ND89rttGgMRL9QXBOcBXlTd8HyU0fIRpivR4HDodlEvo2Ia7bdCrhBm_w&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
        ],
      },
      {
        dayNumber: 4,
        locations: [
          {
            name: '美第奇噴泉',
            address: 'Rue de Médicis, 75006 Paris, 法國',
            placeId: 'ChIJVXo3ktxx5kcRfG9kB3YF1mc',
            lat: 48.84806669999999685,
            lng: 2.339307999999999943,
            type: 'attraction',
            openingHours: '星期一: 07:30 – 19:15',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU4KBw0o_MoazD78TPZSQ7iFYkXjbjRABAtJsFMSKMdusYDTB5CE2XSUmAlt4xk2R4rTnPNLUMXnG2ts5McaPqvRm_nJpmw39q0M_8HOzwE3wuDkEcHbuinfWiN4iUknK1-IAkJCAqZdQRnNvswgqxv1mEGfGTtyDpqN_SgvwMYkWmYjdnI7tYa7-OBtW_XJP2IUl4jRdquG0Amfyib7AVroXc4ibGdHXQrwwwqdEN6olqYpMB6Sbr9GnuxVd8JddwatP3l2oGUfddzkUmP5qbR5Y7MAFYX6sH7Fatqe_0-ZPmsgqJiXYdZ73ST9HPiHzPP9OpU0qgS6XGr7ZLP531CB1e2fAn34_ih6I5A2XctbdPtHi8il4WXRWyPm7MEQrn0h7R3SSm15Ts1HR2ZimLGqMhHmSaHJdmwZhlsDjKPlO77B&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: 'Resto Hua',
            address: '6 Rue Michel Peter, 75013 Paris, 法國',
            placeId: 'ChIJ7--BiThx5kcRpdzIB3ewyOo',
            lat: 48.8366868000000025,
            lng: 2.353225999999999818,
            type: 'restaurant',
            openingHours: '星期一: 12:00 – 15:00, 18:00 – 22:00',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU5gmgFmaBB7lJpViBpv8OC8NtrZoFYpEwKEHtufNr8FcliZAlMz4ybjBd_xVcAms6a8ebN7jOXaA627CVaNSdpgMpyayjAYXLThedHFQbxmXckP-XBotfXWMO-h-Du_5Q9X3AjLImZgcTJpwuQCkFfP8932oXSubMth4DdnwxpmBQblpiYSklkJ3lbd1oMFZPRSwGqu3vAW-ly4dbt3WyL05E_g6OL9K0uhUk1NfuIByZe7Ajns2ND89rttGgMRL9QXBOcBXlTd8HyU0fIRpivR4HDodlEvo2Ia7bdCrhBm_w&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
        ],
      },
    ],
  },
  {
    name: 'Tainan',
    startDate: '2025-10-31',
    endDate: '2025-11-01',
    coverImage: 'https://images.unsplash.com/photo-1599768793949-2da217e9f093?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
    days: [
      {
        dayNumber: 1,
        locations: [
          {
            name: '懷舊小棧杏仁豆腐冰',
            address: '700台灣臺南市中西區五妃街206號',
            placeId: 'ChIJ6dNJgoB2bjQRgTFxy_f35JY',
            lat: 22.98273680000000141,
            lng: 120.2052613999999978,
            type: 'restaurant',
            openingHours: '星期一: 10:30 – 22:00, 星期二: 10:30 – 22:00, 星期三: 10:30 – 22:00, 星期四: 10:30 – 22:00, 星期五: 10:30 – 21:30, 星期六: 10:30 – 21:00, 星期日: 12:00 – 21:00',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU52f_PQK51PXoM4mSIyetjrhL_1XyebcbKWOHMABCBI3HW4ak7RZ-bZYTLv8MWAeXGNXpbE2w9OjE9PxHAUnPwXUq1sI-ng5j-VmT9rl8x-BJmQK2tr-ku397rBDJCBgrNpfNa8eFhvovFg_vVi47gaP2rPAXA_698DN7CPYZgeJajCh7GProPxJR6SLnNEpICJIxZ4avjB7DIQm30wd0BTIi-iSB-LV08Z_1vsjZtJ8jOo8KKsFdBQtevsRcea_ZkOZ5-7h6A-OEVV_qLAMwhtOXud_eV2Igs0QYqAfy1tWQk_t446IK39VpftFUUhk0_c0FsC3_TYiyYpPrsdIsYrcbGg1GngOKFrWVFTpVTq20MFy7Jo1I-HN_KWwY4_UehDXO5tDQlhhJQmKDX5mdvLLy-MLLIHtpgfbTIjTaM-GQ&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: '永樂市場',
            address: '700台灣臺南市中西區國華街三段123號',
            placeId: 'ChIJV_uMsWZ2bjQRL7udKmCf8SU',
            lat: 22.99758609999999948,
            lng: 120.1989138999999938,
            type: 'attraction',
            openingHours: '星期一: 07:30 – 17:30, 星期二: 07:30 – 17:30, 星期三: 07:30 – 17:30, 星期四: 07:30 – 17:30, 星期五: 07:30 – 17:30, 星期六: 07:30 – 17:30, 星期日: 07:30 – 17:30',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU4S2MvtwQM3TCnerZlO-rG76AjABEfP82oTsN_gdAorTzaXOPuRv3NL9-whkXADJqvDHNs8Sjn04tiRUopob9d_j8VTbgI1ERBgkRzfPir3Wj6gD3l3PoszmDo6kJ4M8DwV4hPTIFii2wppw2S9LnXD20vr_0sDoI3KPq_QvQxXBbqjoDH7QU6qnet783fF2zRrFQr690KFrfm0JbaAy4N4cJ5nhQuRNkDusKdGm_ZoceoUz6SxKcF8yyMAWxF4sSslTrPG7h5fJqGFebl9H_KDZjwveZMWyzkOysayjGk7DsFxvTLv0Atj4_Pqf9M7GUkDoKGzmFGr8DyztdP6BSzthRZ6lVPRTocjOsfUt1NoMUb_oMGvpJCQt3i2Z6TuKKJ_WenvhpOuxbXsgplgqBG2BMYf9stfpvrNayVRCL8&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: '台南葡吉麵包店',
            address: '704台灣臺南市北區成功路200號',
            placeId: 'ChIJdVFPSmB2bjQRn2aXiBaj_gM',
            lat: 22.99901339999999906,
            lng: 120.2036690000000049,
            type: 'restaurant',
            openingHours: '星期一: 08:00 – 20:00, 星期二: 08:00 – 20:00, 星期三: 08:00 – 20:00, 星期四: 08:00 – 20:00, 星期五: 08:00 – 20:00, 星期六: 08:00 – 20:00, 星期日: 08:00 – 20:00',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU5Kg2z88bM4PhovTbdw-4FZEjXOGDcK8PanbHepA1zZ0b2is_R0Ak8X91m9JR57xpdncRSBhb-1jLOW-0gXWGdEjDORz9znZE4yUA4oLcNkUDDfySnXGW82H_ixBpWa_8Ga153PWa1DDz6FyHWiob4boVmvZmFfI7kX0Kq7BXNxvyXOi_g-jr790Xm0zWIGoZBxbw8kQp3r9L5127j_Zhf7GtJ4Ki1TjO-7Nc0vv_qc89XQ_8g-kTH3tkFLQ_4ndlAsZ43yqmyGtImD8acHqoZXQuwe8PzMhdPZoiRrgbx7Qg&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
          {
            name: '臺南市美術館二館',
            address: '700台灣臺南市中西區忠義路二段1號',
            placeId: 'ChIJ7Ruxw3x2bjQRZk4MEAECIq4',
            lat: 22.99037500000000022,
            lng: 120.2013553999999971,
            type: 'attraction',
            openingHours: '星期一: 休息, 星期二: 10:00 – 18:00, 星期三: 10:00 – 18:00, 星期四: 10:00 – 18:00, 星期五: 10:00 – 18:00, 星期六: 10:00 – 21:00, 星期日: 10:00 – 18:00',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU7GuyEAahUP7_Ax8J4aNVEDTVZgHnQvl31SF4OwoU_iPNjv4tQa2B1sVoZp8aKWOWd7boANX5jlHwbwqdHxv9VkeaEhfuaog57KR52iv16wnRt-JMcXzxpzBzfFZw0LkMUFB3ANRu8niHpR0-TZbwVYB95znX46lBzY5tLhOlAUJGeXO2vUiMrUOUqmfeWh3aC4-dFqHgkrbpVsnhpRKf2uSMMdXzgIF2lqfApstydsfulelWKFztTOi7NO0PLlFtxtYNaXLp-6iRfXh5BTnEpxc2v9E5RTjXZ0-BeDIEqZB3LsE0hebm6VZnP6ONFOt0uffENHW2roD8-PsVzkp_w731cm0YodAnImZT0wE-bZR0A7ADYpPaXfO8aeRImBZQxlEzXFZRxNL21Zu44kQ8ebH3ckyyKW_ZNnmmctEWAYew&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
        ],
      },
      {
        dayNumber: 2,
        locations: [
          {
            name: '大東夜市',
            address: '701台灣臺南市東區林森路一段276號',
            placeId: 'ChIJPUnSeZt2bjQRbdloDIos_Po',
            lat: 22.98261319999999941,
            lng: 120.2193412000000023,
            type: 'attraction',
            openingHours: '星期一: 18:00 – 01:00, 星期二: 18:00 – 01:00, 星期三: 休息, 星期四: 休息, 星期五: 18:00 – 01:00, 星期六: 休息, 星期日: 休息',
            photoUrl: 'https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAWn5SU7XFIh_C8rrsNx0TGjUT-Tkzpmce-ykjIpsfVg12vf_oeygphdD0DKAvcPqsP1bfHlS5j6jTwsJ9EfWA5O5Oq_i35WxJ2zhZ__QNDp2AOXwRqaD-KGlgmDNe5ua1tF2gsuW5fTCNmRFeGqw81M_ALOlo5XekTOxucI6Z0bQ7WyJCin7gQpg9_IabnbmBSH9KjoFiSzRZ6HPLuHXWiOYER0FTl99adJDSph_95KPesLJuOyjjG0F3Jpv8fqKTVVb2AD7P8OuLd92wIZ-bg38EecN7UygzCPa28PKUfKq57hC60Kduhx3q4t6pitzT_X6IEf-cDNZEJew7xjBVGit2JiRQ_IhccBqoKIjQGYwCo63OIMH1qMj3ZWzTutmnkHwO4AiCd4SzjJKQ04dCqIN17V71TaPMA6A4DYD9AG9a1a-Aw&3u400&3u300&5m1&2e1&callback=none&key=YOUR_API_KEY',
          },
        ],
      },
    ],
  },
];

/**
 * Create seed trips for a new user
 */
export async function createSeedTripsForUser(userId: string): Promise<void> {
  try {
    console.log(`Creating seed trips for user: ${userId}`);
    
    for (const tripData of SEED_TRIPS) {
      const tripId = database.generateId();
      const createdAt = database.getCurrentTimestamp();
      
      // Create trip
      await database.run(
        'INSERT INTO trips (id, user_id, name, start_date, end_date, cover_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [tripId, userId, tripData.name, tripData.startDate, tripData.endDate, tripData.coverImage, createdAt, createdAt]
      );
      
      console.log(`  Created trip: ${tripData.name}`);
      
      // Create saved locations and day schedules
      for (const dayData of tripData.days) {
        for (let i = 0; i < dayData.locations.length; i++) {
          const locationData = dayData.locations[i];
          
          // Create saved location
          const savedLocationId = database.generateId();
          await database.run(
            'INSERT INTO saved_locations (id, user_id, trip_id, name, address, place_id, lat, lng, type, opening_hours, photo_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              savedLocationId,
              userId,
              tripId,
              locationData.name,
              locationData.address,
              locationData.placeId,
              locationData.lat,
              locationData.lng,
              locationData.type,
              locationData.openingHours || null,
              locationData.photoUrl || null,
              createdAt
            ]
          );
          
          // Create day schedule
          const dayScheduleId = database.generateId();
          await database.run(
            'INSERT INTO day_schedules (id, trip_id, day_number, position, saved_location_id) VALUES (?, ?, ?, ?, ?)',
            [dayScheduleId, tripId, dayData.dayNumber, i + 1, savedLocationId]
          );
        }
        
        console.log(`    Added ${dayData.locations.length} locations to day ${dayData.dayNumber}`);
      }
    }
    
    console.log('Seed trips created successfully');
  } catch (error) {
    console.error('Error creating seed trips:', error);
    throw error;
  }
}

