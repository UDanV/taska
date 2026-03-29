import Header from "../feature/marketing/header";
import { Footer } from "../feature/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
        {children}
      <Footer />
    </>
  );
}