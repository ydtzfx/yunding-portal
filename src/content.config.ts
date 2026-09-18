import { defineCollection, z } from 'astro:content';
const research=defineCollection({loader: async()=>[],schema:z.object({title:z.string(),date:z.coerce.date(),category:z.string(),author:z.string(),summary:z.string(),draft:z.boolean().default(false)})});
export const collections={research};
