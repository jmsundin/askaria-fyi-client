import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import Sidebar from "./components/Sidebar";
import { authFetch, clearToken, type AuthUser } from "./auth";
import { debounce } from "lodash-es";

type AgentProfilePayload = {
  businessName: string;
  businessPhoneNumber: string;
  businessOverview: string;
};

type AgentProfileResponse = {
  business_name: string;
  business_phone_number: string | null;
  business_overview: string | null;
  core_services?: string[];
};

function normalizePayload(payload: AgentProfilePayload): AgentProfilePayload {
  return {
    businessName: payload.businessName.trim(),
    businessPhoneNumber: payload.businessPhoneNumber.trim(),
    businessOverview: payload.businessOverview.trim(),
  };
}

function arePayloadsEqual(
  firstPayload: AgentProfilePayload | null,
  secondPayload: AgentProfilePayload | null
): boolean {
  if (firstPayload === secondPayload) return true;
  if (firstPayload === null || secondPayload === null) return false;
  return (
    firstPayload.businessName === secondPayload.businessName &&
    firstPayload.businessPhoneNumber === secondPayload.businessPhoneNumber &&
    firstPayload.businessOverview === secondPayload.businessOverview
  );
}

const SAVE_DEBOUNCE_DELAY_MS = 800;

const ONBOARDING_STEPS = [
  { id: 1, label: "Train", status: "complete" as const },
  { id: 2, label: "Customize", status: "active" as const },
  { id: 3, label: "Test", status: "upcoming" as const },
  { id: 4, label: "Launch", status: "upcoming" as const },
];

const BUSINESS_OVERVIEW_CHARACTER_LIMIT = 500;
const TOTAL_FORM_STEPS = 8;
const MAX_RENDERED_FORM_STEP = 2;
const FORM_FIELD_BACKGROUND_COLOR = "#f9f6ff";
const FORM_STEP_PROGRESS_WIDTH: Record<number, number> = {
  1: 25,
  2: 50,
};
const CORE_SERVICES_AUTOSAVE_DEBOUNCE_MS = 800;

export default function QuickStart() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState("");
  const [businessOverview, setBusinessOverview] = useState("");
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [didSave, setDidSave] = useState(false);
  const [didFailSave, setDidFailSave] = useState(false);
  const [isBusinessNameTouched, setIsBusinessNameTouched] = useState(false);
  const [isBusinessPhoneNumberTouched, setIsBusinessPhoneNumberTouched] =
    useState(false);
  const [isBusinessOverviewTouched, setIsBusinessOverviewTouched] =
    useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [activeFormStep, setActiveFormStep] = useState(1);
  const [coreServices, setCoreServices] = useState<string[]>([]);
  const [coreServiceInputValue, setCoreServiceInputValue] = useState("");
  const [coreServicesErrorMessage, setCoreServicesErrorMessage] = useState("");
  const [coreServicesStatus, setCoreServicesStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const coreServicesAbortControllerRef = useRef<AbortController | null>(null);
  const lastSavedCoreServicesRef = useRef<string[]>([]);
  const saveRequestSequenceRef = useRef(0);
  const activeFormStepRef = useRef(1);
  const saveSuccessTimeoutRef = useRef<number | null>(null);
  const lastPersistedPayloadRef = useRef<AgentProfilePayload | null>(null);

  const executeSave = useCallback(
    async (payload: AgentProfilePayload) => {
      const nextSequence = saveRequestSequenceRef.current + 1;
      saveRequestSequenceRef.current = nextSequence;
      setIsSaving(true);
      setDidSave(false);
      setDidFailSave(false);
      if (saveSuccessTimeoutRef.current !== null) {
        window.clearTimeout(saveSuccessTimeoutRef.current);
        saveSuccessTimeoutRef.current = null;
      }
      const normalizedPayload = normalizePayload(payload);
      try {
        const response = await authFetch("/agent-profile", {
          method: "PUT",
          body: JSON.stringify({
            business_name: normalizedPayload.businessName,
            business_phone_number:
              normalizedPayload.businessPhoneNumber === ""
                ? null
                : normalizedPayload.businessPhoneNumber,
            business_overview: normalizedPayload.businessOverview,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to save agent profile");
        }
        lastPersistedPayloadRef.current = normalizedPayload;
        setUser((previousUser) =>
          previousUser
            ? { ...previousUser, name: normalizedPayload.businessName }
            : previousUser
        );
        if (saveRequestSequenceRef.current === nextSequence) {
          setDidSave(true);
          if (activeFormStepRef.current === 1) {
            lastSavedCoreServicesRef.current = coreServices;
          }
          if (activeFormStepRef.current !== 1) {
            saveSuccessTimeoutRef.current = window.setTimeout(() => {
              setDidSave(false);
              saveSuccessTimeoutRef.current = null;
            }, 3000);
          }
        }
      } catch {
        if (saveRequestSequenceRef.current === nextSequence) {
          setDidFailSave(true);
        }
      } finally {
        if (saveRequestSequenceRef.current === nextSequence) {
          setIsSaving(false);
        }
      }
    },
    [coreServices]
  );

  const debouncedSaveAgentProfile = useMemo(
    () =>
      debounce((payload: AgentProfilePayload) => {
        void executeSave(payload);
      }, SAVE_DEBOUNCE_DELAY_MS),
    [executeSave]
  );

  const debouncedSaveCoreServices = useMemo(
    () =>
      debounce(async (services: string[]) => {
        if (coreServicesAbortControllerRef.current) {
          coreServicesAbortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        coreServicesAbortControllerRef.current = abortController;
        setCoreServicesStatus("saving");
        try {
          const response = await authFetch("/agent-profile/core-services", {
            method: "PUT",
            body: JSON.stringify({ core_services: services }),
            signal: abortController.signal,
          });
          if (!response.ok) {
            throw new Error("Failed to save core services");
          }
          lastSavedCoreServicesRef.current = services;
          setCoreServicesStatus("saved");
        } catch (coreServicesError) {
          if (
            !(
              coreServicesError instanceof DOMException &&
              coreServicesError.name === "AbortError"
            )
          ) {
            setCoreServicesStatus("error");
          }
        }
      }, CORE_SERVICES_AUTOSAVE_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSaveAgentProfile.cancel();
      if (saveSuccessTimeoutRef.current !== null) {
        window.clearTimeout(saveSuccessTimeoutRef.current);
        saveSuccessTimeoutRef.current = null;
      }
      debouncedSaveCoreServices.cancel();
      coreServicesAbortControllerRef.current?.abort();
    };
  }, [debouncedSaveAgentProfile, debouncedSaveCoreServices]);

  useEffect(() => {
    activeFormStepRef.current = activeFormStep;
  }, [activeFormStep]);

  useEffect(() => {
    let isComponentMounted = true;
    (async () => {
      try {
        const meResponse = await authFetch("/me");
        if (!meResponse.ok) {
          clearToken();
          window.location.href = "/login";
          return;
        }
        const authenticatedUser: AuthUser = await meResponse.json();
        if (!isComponentMounted) {
          return;
        }
        setUser(authenticatedUser);

        let initialPayload: AgentProfilePayload = {
          businessName: authenticatedUser.name ?? "",
          businessPhoneNumber: "",
          businessOverview: "",
        };

        try {
          const profileResponse = await authFetch("/agent-profile");
          if (profileResponse.status === 401) {
            clearToken();
            window.location.href = "/login";
            return;
          }
          if (profileResponse.ok) {
            const profile: AgentProfileResponse = await profileResponse.json();
            setCoreServices(profile.core_services ?? []);
            lastSavedCoreServicesRef.current = profile.core_services ?? [];
            initialPayload = {
              businessName:
                profile.business_name ?? authenticatedUser.name ?? "",
              businessPhoneNumber: profile.business_phone_number ?? "",
              businessOverview: profile.business_overview ?? "",
            };
          }
        } catch (profileError) {
          if (import.meta.env.DEV) {
            console.error("Failed to load agent profile", profileError);
          }
        }

        const normalizedInitialPayload = normalizePayload(initialPayload);
        if (!isComponentMounted) {
          return;
        }
        setBusinessName(normalizedInitialPayload.businessName);
        setBusinessPhoneNumber(normalizedInitialPayload.businessPhoneNumber);
        setBusinessOverview(normalizedInitialPayload.businessOverview);
        lastPersistedPayloadRef.current = normalizedInitialPayload;
        setHasLoadedProfile(true);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to load authenticated user", error);
        }
      }
    })();

    return () => {
      isComponentMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedProfile) {
      return;
    }
    const pendingPayload = normalizePayload({
      businessName,
      businessPhoneNumber,
      businessOverview,
    });
    if (
      pendingPayload.businessName === "" ||
      pendingPayload.businessOverview === ""
    ) {
      return;
    }
    if (arePayloadsEqual(lastPersistedPayloadRef.current, pendingPayload)) {
      return;
    }
    debouncedSaveAgentProfile(pendingPayload);
  }, [
    businessName,
    businessPhoneNumber,
    businessOverview,
    hasLoadedProfile,
    debouncedSaveAgentProfile,
  ]);

  useEffect(() => {
    if (!hasLoadedProfile || activeFormStep !== 2) {
      return;
    }
    if (
      coreServices.length === lastSavedCoreServicesRef.current.length &&
      coreServices.every(
        (service, index) => service === lastSavedCoreServicesRef.current[index]
      )
    ) {
      return;
    }
    debouncedSaveCoreServices(coreServices);
  }, [
    coreServices,
    hasLoadedProfile,
    activeFormStep,
    debouncedSaveCoreServices,
  ]);

  const trimmedBusinessName = businessName.trim();
  const trimmedBusinessPhoneNumber = businessPhoneNumber.trim();
  const trimmedBusinessOverview = businessOverview.trim();

  const businessNameErrorMessage =
    (hasAttemptedSubmit || isBusinessNameTouched) && trimmedBusinessName === ""
      ? "Business name is required"
      : "";
  const businessPhoneNumberErrorMessage =
    (hasAttemptedSubmit || isBusinessPhoneNumberTouched) &&
    trimmedBusinessPhoneNumber === ""
      ? "Business primary phone number is required"
      : "";
  const businessOverviewErrorMessage =
    (hasAttemptedSubmit || isBusinessOverviewTouched) &&
    trimmedBusinessOverview === ""
      ? "Business overview is required"
      : "";

  const isFormValid =
    businessNameErrorMessage === "" &&
    businessPhoneNumberErrorMessage === "" &&
    businessOverviewErrorMessage === "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeFormStep !== 1) {
      return;
    }
    setHasAttemptedSubmit(true);
    setIsBusinessNameTouched(true);
    setIsBusinessPhoneNumberTouched(true);
    setIsBusinessOverviewTouched(true);
    if (!isFormValid) return;
    const payload = normalizePayload({
      businessName,
      businessPhoneNumber,
      businessOverview,
    });
    debouncedSaveAgentProfile.cancel();
    await executeSave(payload);
  }

  function handleCancel() {
    const lastPersistedPayload = lastPersistedPayloadRef.current;
    if (lastPersistedPayload) {
      setBusinessName(lastPersistedPayload.businessName);
      setBusinessPhoneNumber(lastPersistedPayload.businessPhoneNumber);
      setBusinessOverview(lastPersistedPayload.businessOverview);
    } else {
      setBusinessName(user?.name ?? "");
      setBusinessPhoneNumber("");
      setBusinessOverview("");
    }
    setHasAttemptedSubmit(false);
    setIsBusinessNameTouched(false);
    setIsBusinessPhoneNumberTouched(false);
    setIsBusinessOverviewTouched(false);
    setDidFailSave(false);
    setDidSave(false);
    setActiveFormStep(1);
    setCoreServices([]);
    setCoreServiceInputValue("");
    setCoreServicesErrorMessage("");
    setCoreServicesStatus("idle");
  }

  function handleBusinessNameChange(event: ChangeEvent<HTMLInputElement>) {
    setBusinessName(event.target.value);
    if (activeFormStep === 1) {
      setDidSave(false);
    }
  }

  function handleBusinessPhoneNumberChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setBusinessPhoneNumber(event.target.value);
    if (activeFormStep === 1) {
      setDidSave(false);
    }
  }

  function handleBusinessOverviewChange(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    setBusinessOverview(event.target.value);
    if (activeFormStep === 1) {
      setDidSave(false);
    }
  }

  const normalizedCoreServiceDraft = coreServiceInputValue.trim();

  function commitCoreService() {
    if (normalizedCoreServiceDraft === "") {
      setCoreServicesErrorMessage("Service name is required");
      return;
    }
    if (coreServices.includes(normalizedCoreServiceDraft)) {
      setCoreServicesErrorMessage("Service already added");
      return;
    }
    const updatedServices = [...coreServices, normalizedCoreServiceDraft];
    setCoreServices(updatedServices);
    setCoreServiceInputValue("");
    setCoreServicesErrorMessage("");
    setCoreServicesStatus("saving");
    debouncedSaveCoreServices(updatedServices);
  }

  function handleCoreServicesInputChange(event: ChangeEvent<HTMLInputElement>) {
    setCoreServiceInputValue(event.target.value);
    setCoreServicesErrorMessage("");
  }

  function handleCoreServicesKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitCoreService();
      return;
    }
    if (
      event.key === "Backspace" &&
      coreServiceInputValue === "" &&
      coreServices.length > 0
    ) {
      const updatedServices = coreServices.slice(0, coreServices.length - 1);
      setCoreServices(updatedServices);
      setCoreServicesStatus("saving");
      debouncedSaveCoreServices(updatedServices);
    }
  }

  function handleRemoveCoreService(service: string) {
    const updatedServices = coreServices.filter(
      (existingService) => existingService !== service
    );
    setCoreServices(updatedServices);
    setCoreServicesStatus("saving");
    debouncedSaveCoreServices(updatedServices);
  }

  function handleAddCoreService() {
    commitCoreService();
  }

  function handleGoToNextStep() {
    if (activeFormStep !== 1 || !didSave) {
      return;
    }
    setActiveFormStep((previousStep) =>
      Math.min(previousStep + 1, MAX_RENDERED_FORM_STEP)
    );
    setDidSave(false);
    setHasAttemptedSubmit(false);
    setIsBusinessNameTouched(false);
    setIsBusinessPhoneNumberTouched(false);
    setIsBusinessOverviewTouched(false);
  }

  function handleGoToPreviousStep() {
    if (activeFormStep <= 1) {
      return;
    }
    setActiveFormStep((previousStep) => Math.max(1, previousStep - 1));
    setDidSave(true);
    setHasAttemptedSubmit(false);
    setIsBusinessNameTouched(false);
    setIsBusinessPhoneNumberTouched(false);
    setIsBusinessOverviewTouched(false);
  }

  const sidebarBusinessLabel = user?.name ?? "Your Business";
  const isFirstFormStep = activeFormStep === 1;

  const formStepCopy = isFirstFormStep
    ? {
        title:
          "Let's start by confirming we have your basic business info right.",
        description:
          "This information helps Aria introduce your business and respond accurately to your callers.",
      }
    : {
        title:
          "Here are the core services we've got for your business. Does this look right?",
        description:
          "Type in the offerings you want Aria to highlight so callers understand what you do.",
      };

  const progressLabel = `${activeFormStep}/${TOTAL_FORM_STEPS}`;
  const progressFillPercentage =
    FORM_STEP_PROGRESS_WIDTH[activeFormStep] !== undefined
      ? FORM_STEP_PROGRESS_WIDTH[activeFormStep]
      : Math.min(100, Math.max(0, (activeFormStep / TOTAL_FORM_STEPS) * 100));
  const shouldShowNextButton =
    isFirstFormStep && didSave && !isSaving && activeFormStep === 1;

  const primaryButtonLabel = isSaving
    ? "Saving..."
    : shouldShowNextButton
    ? "Next"
    : didSave
    ? "Saved"
    : "Save Changes";
  const primaryButtonType: "button" | "submit" = shouldShowNextButton
    ? "button"
    : "submit";
  const primaryButtonOnClick = shouldShowNextButton
    ? handleGoToNextStep
    : undefined;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8f6ff",
        color: "#301447",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar activeItem="quick-start" businessLabel={sidebarBusinessLabel} />
      <main
        style={{
          flex: 1,
          padding: "48px 64px 80px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        <nav
          aria-label="Onboarding progress"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            alignItems: "center",
          }}
        >
          {ONBOARDING_STEPS.map((step) => {
            const isStepComplete = step.status === "complete";
            const isStepActive = step.status === "active";
            return (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: isStepActive ? "#6c2bd9" : "#6f5b91",
                  fontWeight: isStepActive ? 700 : 600,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isStepComplete
                      ? "#d8c3ff"
                      : isStepActive
                      ? "#ede6ff"
                      : "#f1eef8",
                    color: isStepComplete ? "#5a189a" : "#7d6ba8",
                    fontWeight: 700,
                  }}
                >
                  {isStepComplete ? "✓" : step.id}
                </span>
                {step.label}
              </div>
            );
          })}
        </nav>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#311b63",
              fontWeight: 700,
            }}
          >
            Customize your agent
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: "660px",
              color: "#7f6e9b",
              fontSize: "16px",
              lineHeight: 1.7,
            }}
          >
            Complete the following steps to help Aria be accurate and effective
            for your callers. You can update these settings whenever you need to
            as your business evolves.
          </p>
        </section>

        <section
          style={{
            borderRadius: "18px",
            border: "1px solid #ede5f6",
            backgroundColor: "#ffffff",
            padding: "24px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#8b78b0",
                letterSpacing: "0.08em",
              }}
            >
              YOUR AGENT IS TRAINED ON
            </span>
            <span style={{ fontSize: "16px", color: "#4d3b6c" }}>
              No sources connected yet
            </span>
          </div>
          <button
            type="button"
            style={{
              border: "1px solid #d7c9f4",
              borderRadius: "999px",
              padding: "10px 20px",
              backgroundColor: "#f8f4ff",
              color: "#5a2bc7",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        </section>

        <section
          style={{
            borderRadius: "28px",
            backgroundColor: "#ffffff",
            boxShadow: "0 28px 60px rgba(48, 18, 84, 0.08)",
            border: "1px solid #ede3ff",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <header
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <h2 style={{ margin: 0, fontSize: "24px", color: "#301254" }}>
              {formStepCopy.title}
            </h2>
            <p style={{ margin: 0, color: "#7b6a97", fontSize: "15px" }}>
              {formStepCopy.description}
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "28px" }}
          >
            {isFirstFormStep ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    htmlFor="business-name"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#3a245d",
                        }}
                      >
                        Business Name
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#f1e8ff",
                          color: "#6c2bd9",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        ?
                      </span>
                    </span>
                    <input
                      id="business-name"
                      name="businessName"
                      type="text"
                      placeholder="Your Business"
                      value={businessName}
                      onChange={handleBusinessNameChange}
                      onBlur={() => setIsBusinessNameTouched(true)}
                      style={{
                        borderRadius: "14px",
                        border: businessNameErrorMessage
                          ? "1px solid #f05c7e"
                          : "1px solid #e4dbf7",
                        padding: "16px 18px",
                        fontSize: "16px",
                        color: "#2d1f47",
                        outline: "none",
                        boxShadow: businessNameErrorMessage
                          ? "0 0 0 3px rgba(240, 92, 126, 0.12)"
                          : "none",
                        backgroundColor: FORM_FIELD_BACKGROUND_COLOR,
                      }}
                    />
                  </label>
                  {businessNameErrorMessage ? (
                    <span
                      style={{
                        color: "#d6456d",
                        fontSize: "13px",
                        paddingLeft: "4px",
                      }}
                    >
                      {businessNameErrorMessage}
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    htmlFor="business-phone-number"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#3a245d",
                        }}
                      >
                        Business Phone
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#f1e8ff",
                          color: "#6c2bd9",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        ?
                      </span>
                    </span>
                    <input
                      id="business-phone-number"
                      name="businessPhoneNumber"
                      type="tel"
                      placeholder="(000) 000-0000"
                      value={businessPhoneNumber}
                      onChange={handleBusinessPhoneNumberChange}
                      onBlur={() => setIsBusinessPhoneNumberTouched(true)}
                      style={{
                        borderRadius: "14px",
                        border: businessPhoneNumberErrorMessage
                          ? "1px solid #f05c7e"
                          : "1px solid #e4dbf7",
                        padding: "16px 18px",
                        fontSize: "16px",
                        color: "#2d1f47",
                        outline: "none",
                        boxShadow: businessPhoneNumberErrorMessage
                          ? "0 0 0 3px rgba(240, 92, 126, 0.12)"
                          : "none",
                        backgroundColor: FORM_FIELD_BACKGROUND_COLOR,
                      }}
                    />
                  </label>
                  {businessPhoneNumberErrorMessage ? (
                    <span
                      style={{
                        color: "#d6456d",
                        fontSize: "13px",
                        paddingLeft: "4px",
                      }}
                    >
                      {businessPhoneNumberErrorMessage}
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    htmlFor="business-overview"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#3a245d",
                        }}
                      >
                        Business Overview
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#f1e8ff",
                          color: "#6c2bd9",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        ?
                      </span>
                    </span>
                    <textarea
                      id="business-overview"
                      name="businessOverview"
                      maxLength={BUSINESS_OVERVIEW_CHARACTER_LIMIT}
                      rows={5}
                      placeholder=""
                      value={businessOverview}
                      onChange={handleBusinessOverviewChange}
                      onBlur={() => setIsBusinessOverviewTouched(true)}
                      style={{
                        borderRadius: "18px",
                        border: businessOverviewErrorMessage
                          ? "1px solid #f05c7e"
                          : "1px solid #e4dbf7",
                        padding: "18px",
                        fontSize: "15px",
                        color: "#2d1f47",
                        outline: "none",
                        resize: "vertical",
                        minHeight: "160px",
                        boxShadow: businessOverviewErrorMessage
                          ? "0 0 0 3px rgba(240, 92, 126, 0.12)"
                          : "none",
                        backgroundColor: FORM_FIELD_BACKGROUND_COLOR,
                      }}
                    />
                  </label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "13px",
                      color: businessOverviewErrorMessage
                        ? "#d6456d"
                        : "#8b7aa6",
                      paddingLeft: "4px",
                    }}
                  >
                    {businessOverviewErrorMessage ? (
                      <span>{businessOverviewErrorMessage}</span>
                    ) : (
                      <span>
                        Share what callers should know when Aria answers.
                      </span>
                    )}
                    <span style={{ color: "#7a69aa", fontWeight: 600 }}>
                      {businessOverview.length}/
                      {BUSINESS_OVERVIEW_CHARACTER_LIMIT}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
            {activeFormStep > 1 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <label
                  htmlFor="core-services-input"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#3a245d",
                      }}
                    >
                      Core Services
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "#f1e8ff",
                        color: "#6c2bd9",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      ?
                    </span>
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      borderRadius: "16px",
                      border: "1px solid #e4dbf7",
                      padding: "12px",
                      backgroundColor: FORM_FIELD_BACKGROUND_COLOR,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                      }}
                    >
                      {coreServices.map((service) => (
                        <span
                          key={service}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(124, 58, 237, 0.12)",
                            color: "#4c1d95",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => handleRemoveCoreService(service)}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#7c3aed",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: "14px",
                              lineHeight: 1,
                            }}
                            aria-label={`Remove ${service}`}
                          >
                            x
                          </button>
                        </span>
                      ))}
                      <input
                        id="core-services-input"
                        name="coreServices"
                        type="text"
                        value={coreServiceInputValue}
                        onChange={handleCoreServicesInputChange}
                        onKeyDown={handleCoreServicesKeyDown}
                        placeholder='Type and hit "Enter" to add new services.'
                        style={{
                          flex: 1,
                          minWidth: "160px",
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          fontSize: "15px",
                          color: "#2d1f47",
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCoreService}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        border: "1px solid #d7c9f4",
                        backgroundColor: "#f8f4ff",
                        color: "#5a2bc7",
                        fontSize: "20px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      aria-label="Add core service"
                    >
                      +
                    </button>
                  </div>
                </label>
                {coreServicesErrorMessage ? (
                  <span
                    style={{
                      color: "#d6456d",
                      fontSize: "13px",
                      paddingLeft: "4px",
                    }}
                  >
                    {coreServicesErrorMessage}
                  </span>
                ) : (
                  <span
                    style={{
                      color: "#7f6e9b",
                      fontSize: "13px",
                      paddingLeft: "4px",
                    }}
                  >
                    Type and hit "Enter" to add new services.
                  </span>
                )}
                {coreServicesStatus === "saving" ? (
                  <span
                    style={{
                      color: "#6f5b91",
                      fontSize: "12px",
                      fontWeight: 600,
                      paddingLeft: "4px",
                    }}
                  >
                    Saving services...
                  </span>
                ) : coreServicesStatus === "saved" ? (
                  <span
                    style={{
                      color: "#4c1d95",
                      fontSize: "12px",
                      fontWeight: 600,
                      paddingLeft: "4px",
                    }}
                  >
                    Services saved.
                  </span>
                ) : coreServicesStatus === "error" ? (
                  <span
                    style={{
                      color: "#d6456d",
                      fontSize: "12px",
                      fontWeight: 600,
                      paddingLeft: "4px",
                    }}
                  >
                    Could not save services. Please try again.
                  </span>
                ) : null}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#6f5b91",
                    fontWeight: 600,
                  }}
                >
                  {progressLabel}
                </span>
                <div
                  style={{
                    width: "180px",
                    height: "8px",
                    borderRadius: "999px",
                    backgroundColor: "#efe7ff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progressFillPercentage}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, rgba(124, 58, 237, 0.85), rgba(236, 72, 153, 0.85))",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    borderRadius: "999px",
                    border: "1px solid #d7c9f4",
                    backgroundColor: "transparent",
                    color: "#5a2bc7",
                    fontWeight: 600,
                    padding: "14px 26px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                {activeFormStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleGoToPreviousStep}
                    style={{
                      borderRadius: "999px",
                      border: "1px solid #d7c9f4",
                      backgroundColor: "#f8f4ff",
                      color: "#5a2bc7",
                      fontWeight: 600,
                      padding: "14px 26px",
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                ) : null}
                <button
                  type={primaryButtonType}
                  onClick={primaryButtonOnClick}
                  style={{
                    borderRadius: "999px",
                    border: "none",
                    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                    color: "#ffffff",
                    fontWeight: 700,
                    padding: "14px 32px",
                    boxShadow: "0 18px 35px rgba(124, 58, 237, 0.28)",
                    cursor: isSaving ? "progress" : "pointer",
                    opacity: isSaving ? 0.85 : 1,
                  }}
                >
                  {primaryButtonLabel}
                </button>
                {didFailSave ? (
                  <span
                    style={{
                      color: "#d6456d",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    Could not save changes. Please try again.
                  </span>
                ) : null}
              </div>
            </div>
          </form>
        </section>

        <section
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "28px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              borderRadius: "22px",
              padding: "18px 24px",
              background: "linear-gradient(105deg, #f5f0ff 0%, #fdf7ff 100%)",
              border: "1px solid #e8ddff",
              flex: "0 1 360px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "48px",
                borderRadius: "16px",
                backgroundColor: "#d8c4ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3a1d65",
                fontWeight: 700,
              }}
            >
              ▶
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <span
                style={{ fontSize: "15px", fontWeight: 600, color: "#311b63" }}
              >
                Want to see more before setting up?
              </span>
              <span style={{ fontSize: "14px", color: "#7f6e9b" }}>
                Watch a quick tour here.
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
