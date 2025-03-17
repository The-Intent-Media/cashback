import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import ExplanationBlock from "@/components/ExplanationBlock";
import { createDirectus, rest, readItems } from "@directus/sdk";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Cashback",
};

export default async function Page({ params }) {
  const client = createDirectus(process.env.CMS_URL, {
    fetchOptions: {
      mode: "cors",
    },
  }).with(rest());

  const landingPages = await client.request(
    readItems("landingPages", {
      filter: {
        slug: { _eq: params.slug },
      },
    })
  );

  if (!landingPages[0]) notFound();

  const slug = params?.slug;
  const landingPage = landingPages[0];

  console.log(landingPage);

  return (
    <div className="flex flex-col min-h-screen">
      <Header logo={landingPage.logo} title={landingPage?.title} />
      <main className="flex-grow container mx-auto px-4 py-8 items-center flex">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <LeadForm
              offerId={landingPage.offerId}
              affiliateId={landingPage.affiliateId}
              slug={slug}
              successLabel={landingPage.successLabel}
              affiliateUrl={landingPage.affiliateUrl}
              formTitle={landingPage.formTitle}
              nameLabel={landingPage.nameLabel}
              emailLabel={landingPage.emailLabel}
              mobileLabel={landingPage.mobileLabel}
              buttonLabel={landingPage.buttonLabel}
              submittingLabel={landingPage.submittingLabel}
              redirectLabel={landingPage.redirectLabel}
            />
          </div>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              {landingPage?.description}
            </p>
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              <ExplanationBlock
                title={landingPage.step1Title}
                className={" bg-muted-foreground/5"}
                description={landingPage.step1Description}
              />
              <ExplanationBlock
                title={landingPage.step2Title}
                className={" bg-muted-foreground/5"}
                description={landingPage.step2Description}
              />
              <ExplanationBlock
                title={landingPage.step3Title}
                className={"bg-blue-radiant text-white"}
                description={landingPage.step3Description}
              />
              <ExplanationBlock
                title={landingPage.step4Title}
                className={"bg-gold-radiant text-white"}
                description={landingPage.step4Description}
              />
              <div className="md:col-span-2">
                <ExplanationBlock
                  title={landingPage.step5Title}
                  className="bg-green-radiant text-white"
                  description={landingPage.step5Description}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer title={landingPage?.title} disclaimer={landingPage?.disclaimer} />
    </div>
  );
}