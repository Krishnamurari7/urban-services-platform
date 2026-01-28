import { Suspense } from "react";
import ServicesClient from "./ServicesClient";

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading services...</div>}>
      <ServicesClient />
    </Suspense>
  );
}
