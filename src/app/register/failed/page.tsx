"use client";
import ButtonRedirect from "@/components/ui/ButtonRedirect";
import { getTeamDocumentsMidtransStatus } from "@/utils/midtrans/getTeamDocumentsMidtransStatus";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CompetitionName = "ExerMind" | "UI/UX Design" | "Business Innovation";

const page = () => {
  const [compName, setCompName] = useState<CompetitionName | "">("");

  const router = useRouter();

  useEffect(() => {
    async function fetchPaymentStatus() {
      const result = await getTeamDocumentsMidtransStatus();

      if (result?.success) {
        if (result.data) {
          if (result.data.midtrans_transaction_status === "settlement") {
            router.push("/");
          }
          // else {
          //     console.log(result.message);
          // }
        } else if (
          result?.message ===
          "Anda tidak memiliki tim terdaftar atau tidak memimpin tim manapun."
        ) {
          router.push("/");
        } else {
          //   console.error("Error fetching payment status:", result?.message);
          router.push("/");
        }
      }
    }

    fetchPaymentStatus();
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      {/* Overlay */}
      <div className="bg-opacity-95 fixed inset-0 z-40 bg-[#0B1120]" />
      {/* Modal Content */}
      <div className="modal-diagonal-cut relative z-50 flex w-250 flex-col items-center rounded-2xl bg-gradient-to-tl from-[#1E3A8A] to-[#059669] py-19 text-center shadow-xl">
        {/* Robot SVG */}
        <img
          src="/register/robot.svg"
          alt="Robot"
          className="mt-2 mb-2 h-32 w-32"
        />
        <h2 className="mb-2 font-orbitron text-3xl font-semibold tracking-wide text-white sm:text-3xl">
          Oh no, there's something wrong with the payment!
        </h2>
        <p className="mb-12 font-exo-2 text-sm text-white sm:text-sm">
          Please resubmit your documents!
        </p>
        <div className="mx-auto flex w-65 flex-col gap-4">
          <ButtonRedirect
            to="/home"
            className="text-md flex h-11 items-center justify-center border-2 bg-white font-semibold text-black transition-all hover:bg-gray-300"
          >
            <img src="/register/home.svg" alt="Home" className="mr-2 h-6 w-6" />
            <p className="text-black">Home</p>
          </ButtonRedirect>
          <ButtonRedirect
            to="/register"
            className="text-md flex h-11 items-center justify-center bg-white font-semibold text-black transition-all hover:bg-gray-300"
          >
            <p className="text-black">Resubmit!</p>
          </ButtonRedirect>
        </div>
      </div>
    </div>
  );
};

export default page;
