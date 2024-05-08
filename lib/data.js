const BASE_URL = process.env.NEXT_PUBLIC_URL;
import languages from './languages.json'

export const data = {
    // Current languages support: 'EN' for english, 'ES' for spanish.
    language: 'EN',
    site_name: "blog-demo",
    author_name: "gmzi",
    title: "blog-demo",
    description: "a Nextjs blog with a dashboard and a text editor that regenerates on-demand",
    ogImage: `${BASE_URL}/og-image.png`,
    social: [
        { name: "github", url: "https://github.com" },
    ],
    profiles: {
        twitter: "",
    },
    contactUrl: "https://discord.gg"
}

export const text = languages[data.language] || languages.EN;
