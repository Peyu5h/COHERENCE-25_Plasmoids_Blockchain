"use client";

import React from "react";
import { useAllCertificates } from "~/hooks/useCertificates";

export default function Temppage() {
  const { certificates, isLoading, error } = useAllCertificates();
  console.log(certificates);
  return (
    <div>
      <div className="">templ</div>
    </div>
  );
}
