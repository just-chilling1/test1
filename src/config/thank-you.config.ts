import { brand } from "./brand.config";
import { support } from "./support.config";

export const thankYouContent = {
  headline: "Congratulations",
  subheadline: `Thanks for purchasing ${brand.productName}`,

  steps: [
    {
      step: 1,
      title: "Sign Up For Your Account",
      ctaLabel: ">> Click Here To Sign Up",
      href: "/signup",
      external: false,
    },
    {
      step: 2,
      title: "Login To Your Account",
      ctaLabel: ">> Click Here To Sign In",
      href: "/login",
      external: false,
    },
    {
      step: 3,
      title: "Watch The Bonus Training That Took Me To Earning $1k-$5k Per Day...",
      ctaLabel: "Click Here To See How >>",
      href: "/training",
      external: false,
    },
  ],

  attention: {
    enabled: true,
    title: "ATTENTION",
    body: `If you are having payment issues, such as double charges, or other problems do not contact your bank, which will lengthen the refund process. For payment related problems contact ${support.email}.`,
    signupNote: "If You Have Not Been Able To Sign Up Please Open Support Ticket",
    replyNote: "(And Please Allow Us 24 Hours For Reply)",
    ctaLabel: "Click Here To Contact Support",
    ctaUrl: support.contactUrl,
  },

  disclaimer: {
    enabled: true,
    text: `Please note that this product does not provide any guarantee of income or success. The results achieved by the product owner or any other individuals mentioned are not indicative of future success or earnings. All content on this website is protected by copyright law. Unauthorized copying or duplication is strictly prohibited.`,
    copyright: `Copyright ${new Date().getFullYear()}. ${brand.productName}. All Rights Reserved.`,
  },
} as const;
