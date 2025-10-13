import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Sidebar from "./components/Sidebar";
import { authFetch, clearToken, type AuthUser } from "./auth";
import { debounce } from "lodash-es";
import { useNavigate } from "react-router-dom";

type AgentProfileFaqEntry = {
  question: string;
  answer: string;
};

type AgentProfilePayload = {
  businessName: string;
  businessPhoneNumber: string;
  businessOverview: string;
  coreServices: string[];
  faqEntries: AgentProfileFaqEntry[];
  greeting: string;
};

type AgentProfileResponse = {
  business_name: string;
  business_phone_number: string | null;
  business_overview: string | null;
  core_services?: string[];
  faq?: Array<{
    question?: string | null;
    answer?: string | null;
  }>;
  greeting?: string | null;
};

const DEFAULT_GREETING_MESSAGE =
  "Hello, thank you for calling Infoverse AI. Our call may be recorded today for quality control purposes. My name is Aria, how can I help you?";

const RECORDING_DISCLAIMER_SENTENCE =
  "Our call may be recorded today for quality control purposes.";

const quickStartPageContainerStyles: CSSProperties = {
  width: "100%",
  display: "flex",
  minHeight: "100vh",
  background: "var(--app-background-gradient)",
  color: "var(--text-primary)",
  fontFamily: "inherit",
};

const quickStartMainLayoutStyles: CSSProperties = {
  flex: 1,
  padding: "36px 40px 64px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  height: "100vh",
  overflowY: "auto",
  boxSizing: "border-box",
};

function removeRecordingDisclaimerSentence(text: string): string {
  const escapedSentence = RECORDING_DISCLAIMER_SENTENCE.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const withoutSentence = text
    .replace(new RegExp(`\\s*${escapedSentence}`), "")
    .replace(/\s{2,}/g, " ")
    .replace(/\.([A-Z])/g, ". $1")
    .trim();
  return withoutSentence;
}

function addRecordingDisclaimerSentence(text: string): string {
  if (text.includes(RECORDING_DISCLAIMER_SENTENCE)) {
    return text;
  }
  const trimmed = text.trim();
  if (trimmed === "") {
    return RECORDING_DISCLAIMER_SENTENCE;
  }
  const needsSeparator = /[.!?]$/.test(trimmed);
  const separator = needsSeparator ? " " : ". ";
  return `${trimmed}${separator}${RECORDING_DISCLAIMER_SENTENCE}`.replace(
    /\s{2,}/g,
    " "
  );
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item.trim() : String(item).trim()
      )
      .filter((item) => item !== "");
  }
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (trimmedValue === "") {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmedValue);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) =>
            typeof item === "string" ? item.trim() : String(item).trim()
          )
          .filter((item) => item !== "");
      }
    } catch {
      // fall through to treat as single entry
    }
    return [trimmedValue];
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [String(value).trim()].filter((item) => item !== "");
}

function sanitizeFaqEntries(
  entries: AgentProfileFaqEntry[]
): AgentProfileFaqEntry[] {
  return entries
    .map((entry) => ({
      question: entry.question.trim(),
      answer: entry.answer.trim(),
    }))
    .filter((entry) => entry.question !== "" || entry.answer !== "");
}

function coerceFaqEntries(
  entries: AgentProfileResponse["faq"]
): AgentProfileFaqEntry[] {
  if (!entries) {
    return [];
  }

  let iterableEntries: unknown = entries;
  if (!Array.isArray(iterableEntries)) {
    if (typeof iterableEntries === "string") {
      const trimmed = iterableEntries.trim();
      if (trimmed === "") {
        return [];
      }
      try {
        const parsed = JSON.parse(trimmed);
        iterableEntries = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        iterableEntries = [trimmed];
      }
    } else {
      iterableEntries = [iterableEntries];
    }
  }

  const normalizedEntries: AgentProfileFaqEntry[] = [];
  for (const rawEntry of iterableEntries as unknown[]) {
    if (!rawEntry) {
      continue;
    }
    if (typeof rawEntry === "string") {
      const trimmedQuestion = rawEntry.trim();
      if (trimmedQuestion !== "") {
        normalizedEntries.push({ question: trimmedQuestion, answer: "" });
      }
      continue;
    }
    if (typeof rawEntry === "object") {
      const questionValue =
        (rawEntry as { question?: unknown }).question === null ||
        (rawEntry as { question?: unknown }).question === undefined
          ? ""
          : String((rawEntry as { question?: unknown }).question).trim();
      const answerValue =
        (rawEntry as { answer?: unknown }).answer === null ||
        (rawEntry as { answer?: unknown }).answer === undefined
          ? ""
          : String((rawEntry as { answer?: unknown }).answer).trim();
      if (questionValue !== "" || answerValue !== "") {
        normalizedEntries.push({
          question: questionValue,
          answer: answerValue,
        });
      }
    }
  }
  return normalizedEntries;
}

function normalizePayload(payload: AgentProfilePayload): AgentProfilePayload {
  return {
    businessName: payload.businessName.trim(),
    businessPhoneNumber: payload.businessPhoneNumber.trim(),
    businessOverview: payload.businessOverview.trim(),
    coreServices: normalizeStringArray(payload.coreServices),
    faqEntries: sanitizeFaqEntries(payload.faqEntries),
    greeting: payload.greeting.trim(),
  };
}

function arePayloadsEqual(
  firstPayload: AgentProfilePayload | null,
  secondPayload: AgentProfilePayload | null
): boolean {
  if (firstPayload === secondPayload) return true;
  if (firstPayload === null || secondPayload === null) return false;
  const firstCoreServices = normalizeStringArray(firstPayload.coreServices);
  const secondCoreServices = normalizeStringArray(secondPayload.coreServices);
  if (
    firstPayload.businessName !== secondPayload.businessName ||
    firstPayload.businessPhoneNumber !== secondPayload.businessPhoneNumber ||
    firstPayload.businessOverview !== secondPayload.businessOverview ||
    firstPayload.greeting !== secondPayload.greeting ||
    firstCoreServices.length !== secondCoreServices.length
  ) {
    return false;
  }
  if (
    firstCoreServices.some(
      (service, index) => service !== secondCoreServices[index]
    )
  ) {
    return false;
  }
  const firstFaqEntries = sanitizeFaqEntries(firstPayload.faqEntries);
  const secondFaqEntries = sanitizeFaqEntries(secondPayload.faqEntries);
  if (firstFaqEntries.length !== secondFaqEntries.length) {
    return false;
  }
  return firstFaqEntries.every((entry, index) => {
    const other = secondFaqEntries[index];
    return entry.question === other.question && entry.answer === other.answer;
  });
}

const SAVE_DEBOUNCE_DELAY_MS = 1600;

const CUSTOMIZE_ONBOARDING_STEPS = [
  { id: 1, label: "Customize", status: "active" as const },
  { id: 2, label: "Test", status: "upcoming" as const },
  { id: 3, label: "Launch", status: "upcoming" as const },
];

const BUSINESS_OVERVIEW_CHARACTER_LIMIT = 500;
const TOTAL_FORM_STEPS = 4;
const MAX_RENDERED_FORM_STEP = 4;
const FORM_FIELD_BACKGROUND_COLOR = "var(--surface-highlight)";
const FORM_FIELD_BORDER_COLOR = "var(--border-strong)";
const FORM_FIELD_ERROR_BORDER_COLOR = "var(--text-negative)";
const FORM_FIELD_LABEL_COLOR = "var(--text-secondary)";
const FORM_FIELD_ICON_BACKGROUND = "var(--surface-overlay)";
const FORM_FIELD_ICON_COLOR = "var(--brand-primary-strong)";
const FORM_FIELD_ERROR_GLOW = "0 0 0 3px rgba(250, 113, 113, 0.18)";
const CORE_SERVICES_AUTOSAVE_DEBOUNCE_MS = 1600;
const FAQ_AUTOSAVE_DEBOUNCE_MS = 1600;
const GREETING_AUTOSAVE_DEBOUNCE_MS = 1600;

export default function QuickStart() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState("");
  const [businessOverview, setBusinessOverview] = useState("");
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [didFailSave, setDidFailSave] = useState(false);
  const [isBusinessNameTouched, setIsBusinessNameTouched] = useState(false);
  const [isBusinessPhoneNumberTouched, setIsBusinessPhoneNumberTouched] =
    useState(false);
  const [isBusinessOverviewTouched, setIsBusinessOverviewTouched] =
    useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [activeFormStep, setActiveFormStep] = useState(1);
  const [coreServices, setCoreServices] = useState<string[]>([]);
  const [faqEntries, setFaqEntries] = useState<AgentProfileFaqEntry[]>([]);
  const [coreServiceInputValue, setCoreServiceInputValue] = useState("");
  const [greetingDraft, setGreetingDraft] = useState(DEFAULT_GREETING_MESSAGE);
  const [isEditingGreeting, setIsEditingGreeting] = useState(false);
  const [greetingStatus, setGreetingStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [greetingOriginal, setGreetingOriginal] = useState(
    DEFAULT_GREETING_MESSAGE
  );
  const [didChangeGreeting, setDidChangeGreeting] = useState(false);
  const [coreServicesErrorMessage, setCoreServicesErrorMessage] = useState("");
  const [coreServicesStatus, setCoreServicesStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [faqStatus, setFaqStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const coreServicesAbortControllerRef = useRef<AbortController | null>(null);
  const faqAbortControllerRef = useRef<AbortController | null>(null);
  const greetingAbortControllerRef = useRef<AbortController | null>(null);
  const lastSavedCoreServicesRef = useRef<string[]>([]);
  const saveRequestSequenceRef = useRef(0);
  const activeFormStepRef = useRef(1);
  const saveSuccessTimeoutRef = useRef<number | null>(null);
  const lastPersistedPayloadRef = useRef<AgentProfilePayload | null>(null);
  const [hasPendingProfileChanges, setHasPendingProfileChanges] =
    useState(false);
  const navigate = useNavigate();

  function handleLogout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    clearToken();
    window.location.href = "/login";
  }

  const executeSave = useCallback(
    async (payload: AgentProfilePayload) => {
      const nextSequence = saveRequestSequenceRef.current + 1;
      saveRequestSequenceRef.current = nextSequence;
      setIsSaving(true);
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
            core_services: normalizedPayload.coreServices,
            faq: normalizedPayload.faqEntries,
            greeting: normalizedPayload.greeting,
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
          setDidFailSave(false);
          setHasPendingProfileChanges(false);
          if (activeFormStepRef.current === 1) {
            lastSavedCoreServicesRef.current = coreServices;
          }
          if (activeFormStepRef.current !== 1) {
            saveSuccessTimeoutRef.current = window.setTimeout(() => {
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
    [coreServices, faqEntries]
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
          await executeSave({
            businessName,
            businessPhoneNumber,
            businessOverview,
            coreServices: services,
            faqEntries,
            greeting: greetingDraft,
          });
          if (!abortController.signal.aborted) {
            lastSavedCoreServicesRef.current = services;
            setCoreServicesStatus("saved");
          }
        } catch (coreServicesError) {
          if (
            !(
              coreServicesError instanceof DOMException &&
              coreServicesError.name === "AbortError"
            )
          ) {
            if (!abortController.signal.aborted) {
              setCoreServicesStatus("error");
            }
          }
        }
      }, CORE_SERVICES_AUTOSAVE_DEBOUNCE_MS),
    [
      executeSave,
      businessName,
      businessPhoneNumber,
      businessOverview,
      faqEntries,
      greetingDraft,
    ]
  );

  const debouncedSaveFaq = useMemo(
    () =>
      debounce(async (entries: AgentProfileFaqEntry[]) => {
        if (faqAbortControllerRef.current) {
          faqAbortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        faqAbortControllerRef.current = abortController;
        setFaqStatus("saving");
        try {
          await executeSave({
            businessName,
            businessPhoneNumber,
            businessOverview,
            coreServices,
            faqEntries: entries,
            greeting: greetingDraft,
          });
          if (!abortController.signal.aborted) {
            setFaqStatus("saved");
          }
        } catch (faqError) {
          if (
            !(
              faqError instanceof DOMException && faqError.name === "AbortError"
            )
          ) {
            if (!abortController.signal.aborted) {
              setFaqStatus("error");
            }
          }
        }
      }, FAQ_AUTOSAVE_DEBOUNCE_MS),
    [
      executeSave,
      businessName,
      businessPhoneNumber,
      businessOverview,
      coreServices,
      greetingDraft,
    ]
  );

  const debouncedSaveGreeting = useMemo(
    () =>
      debounce(async (greeting: string) => {
        if (greetingAbortControllerRef.current) {
          greetingAbortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        greetingAbortControllerRef.current = abortController;
        setGreetingStatus("saving");
        try {
          await executeSave({
            businessName,
            businessPhoneNumber,
            businessOverview,
            coreServices,
            faqEntries,
            greeting,
          });
          if (!abortController.signal.aborted) {
            setGreetingStatus("saved");
            setGreetingOriginal(greeting);
            setDidChangeGreeting(false);
          }
        } catch (greetingError) {
          if (
            !(
              greetingError instanceof DOMException &&
              greetingError.name === "AbortError"
            )
          ) {
            if (!abortController.signal.aborted) {
              setGreetingStatus("error");
            }
          }
        }
      }, GREETING_AUTOSAVE_DEBOUNCE_MS),
    [
      executeSave,
      businessName,
      businessPhoneNumber,
      businessOverview,
      coreServices,
      faqEntries,
    ]
  );

  useEffect(() => {
    return () => {
      debouncedSaveAgentProfile.cancel();
      if (saveSuccessTimeoutRef.current !== null) {
        window.clearTimeout(saveSuccessTimeoutRef.current);
        saveSuccessTimeoutRef.current = null;
      }
      debouncedSaveCoreServices.cancel();
      debouncedSaveFaq.cancel();
      debouncedSaveGreeting.cancel();
      coreServicesAbortControllerRef.current?.abort();
      faqAbortControllerRef.current?.abort();
      greetingAbortControllerRef.current?.abort();
    };
  }, [
    debouncedSaveAgentProfile,
    debouncedSaveCoreServices,
    debouncedSaveFaq,
    debouncedSaveGreeting,
  ]);

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
          coreServices: [],
          faqEntries: [],
          greeting: DEFAULT_GREETING_MESSAGE,
        };

        try {
          const profileResponse = await authFetch("/agent-profile");
          if (profileResponse.status === 401) {
            clearToken();
            window.location.href = "/login";
            return;
          }
          if (profileResponse.ok) {
            const profile: AgentProfileResponse & { greeting?: string } =
              await profileResponse.json();
            setCoreServices(profile.core_services ?? []);
            lastSavedCoreServicesRef.current = profile.core_services ?? [];
            initialPayload = {
              businessName:
                profile.business_name ?? authenticatedUser.name ?? "",
              businessPhoneNumber: profile.business_phone_number ?? "",
              businessOverview: profile.business_overview ?? "",
              coreServices: profile.core_services ?? [],
              faqEntries: coerceFaqEntries(profile.faq),
              greeting: profile.greeting ?? DEFAULT_GREETING_MESSAGE,
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
        setCoreServices(normalizedInitialPayload.coreServices);
        setFaqEntries(normalizedInitialPayload.faqEntries);
        setGreetingDraft(normalizedInitialPayload.greeting);
        setGreetingOriginal(normalizedInitialPayload.greeting);
        setDidChangeGreeting(false);
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
    if (!hasLoadedProfile || activeFormStep !== 3) {
      return;
    }
    debouncedSaveFaq(faqEntries);
  }, [faqEntries, hasLoadedProfile, activeFormStep, debouncedSaveFaq]);

  useEffect(() => {
    if (!hasLoadedProfile) {
      return;
    }
    const payload = normalizePayload({
      businessName,
      businessPhoneNumber,
      businessOverview,
      coreServices,
      faqEntries,
      greeting: greetingDraft,
    });
    if (payload.businessName === "" || payload.businessOverview === "") {
      return;
    }
    if (arePayloadsEqual(lastPersistedPayloadRef.current, payload)) {
      return;
    }
    setDidFailSave(false);
    setHasPendingProfileChanges(true);
    debouncedSaveAgentProfile(payload);
  }, [
    businessName,
    businessPhoneNumber,
    businessOverview,
    coreServices,
    faqEntries,
    greetingDraft,
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

  useEffect(() => {
    if (!hasLoadedProfile) {
      return;
    }
    setDidChangeGreeting(greetingDraft.trim() !== greetingOriginal.trim());
  }, [greetingDraft, greetingOriginal, hasLoadedProfile]);

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
      coreServices,
      faqEntries,
      greeting: greetingDraft,
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
      setCoreServices(lastPersistedPayload.coreServices);
      setFaqEntries(lastPersistedPayload.faqEntries);
      setGreetingDraft(lastPersistedPayload.greeting);
    } else {
      setBusinessName(user?.name ?? "");
      setBusinessPhoneNumber("");
      setBusinessOverview("");
      setCoreServices([]);
      setFaqEntries([]);
      setGreetingDraft(DEFAULT_GREETING_MESSAGE);
    }
    setHasAttemptedSubmit(false);
    setIsBusinessNameTouched(false);
    setIsBusinessPhoneNumberTouched(false);
    setIsBusinessOverviewTouched(false);
    setDidFailSave(false);
    setActiveFormStep(1);
    setCoreServices([]);
    setCoreServiceInputValue("");
    setCoreServicesErrorMessage("");
    setCoreServicesStatus("idle");
    setFaqStatus("idle");
    setHasPendingProfileChanges(false);
    setGreetingStatus("idle");
    setIsEditingGreeting(false);
    greetingAbortControllerRef.current?.abort();
  }

  function handleBusinessNameChange(event: ChangeEvent<HTMLInputElement>) {
    setBusinessName(event.target.value);
    if (activeFormStep === 1) {
      setDidFailSave(false);
      setHasPendingProfileChanges(true);
    }
  }

  function handleBusinessPhoneNumberChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setBusinessPhoneNumber(event.target.value);
    if (activeFormStep === 1) {
      setDidFailSave(false);
      setHasPendingProfileChanges(true);
    }
  }

  function handleBusinessOverviewChange(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    setBusinessOverview(event.target.value);
    if (activeFormStep === 1) {
      setDidFailSave(false);
      setHasPendingProfileChanges(true);
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

  function handleAddFaqEntry() {
    setFaqEntries((previousEntries) => [
      ...previousEntries,
      { question: "", answer: "" },
    ]);
    setFaqStatus("idle");
  }

  function handleRemoveFaqEntry(indexToRemove: number) {
    setFaqEntries((previousEntries) => {
      const nextEntries = previousEntries.filter(
        (_, entryIndex) => entryIndex !== indexToRemove
      );
      debouncedSaveFaq(nextEntries);
      return nextEntries;
    });
  }

  function handleFaqQuestionChange(
    indexToUpdate: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const { value } = event.target;
    setFaqEntries((previousEntries) => {
      const nextEntries = previousEntries.map((entry, entryIndex) =>
        entryIndex === indexToUpdate ? { ...entry, question: value } : entry
      );
      setFaqStatus("saving");
      debouncedSaveFaq(nextEntries);
      return nextEntries;
    });
  }

  function handleFaqAnswerChange(
    indexToUpdate: number,
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    const { value } = event.target;
    setFaqEntries((previousEntries) => {
      const nextEntries = previousEntries.map((entry, entryIndex) =>
        entryIndex === indexToUpdate ? { ...entry, answer: value } : entry
      );
      setFaqStatus("saving");
      debouncedSaveFaq(nextEntries);
      return nextEntries;
    });
  }

  function handleGoToNextStep() {
    if (activeFormStep >= MAX_RENDERED_FORM_STEP) {
      navigate("/app/quick-start/launch");
      return;
    }
    if (activeFormStep === 3) {
      navigate("/app/quick-start/test");
      return;
    }
    if (activeFormStep === 1) {
      if ((hasPendingProfileChanges && !didFailSave) || isSaving) {
        return;
      }
      setActiveFormStep((previousStep) =>
        Math.min(previousStep + 1, MAX_RENDERED_FORM_STEP)
      );
      setHasAttemptedSubmit(false);
      setIsBusinessNameTouched(false);
      setIsBusinessPhoneNumberTouched(false);
      setIsBusinessOverviewTouched(false);
      return;
    }
    if (activeFormStep === 2 && (isSaving || coreServicesStatus === "saving")) {
      return;
    }
    if (activeFormStep === 3 && faqStatus === "saving") {
      return;
    }
    setActiveFormStep((previousStep) =>
      Math.min(previousStep + 1, MAX_RENDERED_FORM_STEP)
    );
  }

  function handleGoToPreviousStep() {
    if (activeFormStep <= 1) {
      return;
    }
    setActiveFormStep((previousStep) => Math.max(1, previousStep - 1));
    setDidFailSave(true);
    setIsBusinessNameTouched(false);
    setIsBusinessPhoneNumberTouched(false);
    setIsBusinessOverviewTouched(false);
  }

  function handleEnableGreetingEdit(isEnabled: boolean) {
    setIsEditingGreeting(isEnabled);
    setGreetingStatus("idle");
    greetingAbortControllerRef.current?.abort();
  }

  function handleGreetingSaveAndClose() {
    const trimmedGreeting = greetingDraft.trim();
    if (trimmedGreeting === "") {
      setGreetingDraft(DEFAULT_GREETING_MESSAGE);
    }
    debouncedSaveGreeting(
      trimmedGreeting === "" ? DEFAULT_GREETING_MESSAGE : trimmedGreeting
    );
    setIsEditingGreeting(false);
  }

  function handleGreetingCancelEdit() {
    setGreetingDraft(greetingOriginal);
    handleEnableGreetingEdit(false);
    setGreetingStatus("idle");
  }

  const sidebarBusinessLabel = user?.name ?? "Your Business";
  const isFirstFormStep = activeFormStep === 1;
  const isCoreServicesStep = activeFormStep === 2;
  const isFaqStep = activeFormStep === 3;
  const isGreetingStep = activeFormStep === 4;
  const hasRecordingDisclaimer = useMemo(
    () => greetingDraft.includes(RECORDING_DISCLAIMER_SENTENCE),
    [greetingDraft]
  );

  const formStepCopy = isFirstFormStep
    ? {
        title:
          "Let's start by confirming we have your basic business info right.",
        description:
          "This information helps Aria introduce your business and respond accurately to your callers.",
        primaryActionLabel: "Next",
      }
    : isCoreServicesStep
    ? {
        title:
          "Here are the core services we've got for your business. Does this look right?",
        description:
          "Type in the offerings you want Aria to highlight so callers understand what you do.",
        primaryActionLabel: "Next",
      }
    : {
        title:
          "Add FAQs about your business so your agent can answer common questions easily.",
        description:
          "Add some common questions to teach your agent about your business. You can add more and update them later.",
        primaryActionLabel: "Next",
      };

  const onboardingProgress = useMemo(() => {
    return CUSTOMIZE_ONBOARDING_STEPS.map((step, index) => {
      const correspondingStep = index + 1;
      if (correspondingStep < activeFormStep) {
        return { ...step, status: "complete" as const };
      }
      if (correspondingStep === activeFormStep) {
        return { ...step, status: "active" as const };
      }
      return { ...step, status: "upcoming" as const };
    });
  }, [activeFormStep]);
  const progressLabel = `${activeFormStep}/${TOTAL_FORM_STEPS}`;
  const progressFillPercentage =
    (Math.min(Math.max(activeFormStep, 0), TOTAL_FORM_STEPS) /
      TOTAL_FORM_STEPS) *
    100;
  const shouldShowNextButton =
    isFirstFormStep && (!hasPendingProfileChanges || didFailSave) && !isSaving;

  const shouldEnableSaveButton =
    isFirstFormStep && hasPendingProfileChanges && !didFailSave && !isSaving;

  const primaryButtonLabel = isSaving
    ? "Saving..."
    : shouldShowNextButton
    ? "Next"
    : shouldEnableSaveButton
    ? "Save Changes"
    : didFailSave
    ? "Next"
    : "Saved";

  const primaryButtonType: "button" | "submit" = shouldEnableSaveButton
    ? "submit"
    : "button";
  const isPrimaryButtonDisabled =
    !shouldEnableSaveButton && !shouldShowNextButton && !didFailSave;
  const primaryButtonOnClick = shouldShowNextButton
    ? () => {
        handleGoToNextStep();
      }
    : shouldEnableSaveButton
    ? undefined
    : didFailSave
    ? () => {
        handleGoToNextStep();
      }
    : undefined;

  function handleRecordingDisclaimerToggle() {
    setGreetingDraft((previous) => {
      const nextGreeting = hasRecordingDisclaimer
        ? removeRecordingDisclaimerSentence(previous)
        : addRecordingDisclaimerSentence(previous);
      setGreetingStatus("saving");
      debouncedSaveGreeting(nextGreeting);
      return nextGreeting;
    });
  }

  return (
    <div style={quickStartPageContainerStyles}>
      <Sidebar activeItem="quick-start" businessLabel={sidebarBusinessLabel} />
      <main style={quickStartMainLayoutStyles}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            color: "var(--text-secondary)",
          }}
        >
          <a
            href="#logout"
            onClick={handleLogout}
            style={{
              fontWeight: 600,
              color: "var(--brand-primary)",
              textDecoration: "none",
              marginTop: "6px",
            }}
          >
            Log out
          </a>
        </div>
        <nav
          aria-label="Onboarding progress"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            alignItems: "center",
            width: "100%",
            maxWidth: "1080px",
            margin: "0 auto",
          }}
        >
          {onboardingProgress.map((step) => {
            const isStepComplete = step.status === "complete";
            const isStepActive = step.status === "active";
            return (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: isStepActive
                    ? "var(--brand-primary-strong)"
                    : "var(--text-secondary)",
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
                      ? "var(--surface-highlight)"
                      : isStepActive
                      ? "var(--surface-muted)"
                      : "var(--surface-elevated)",
                    color: isStepComplete
                      ? "var(--brand-primary-strong)"
                      : "var(--text-secondary)",
                    fontWeight: 700,
                    border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
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
            borderRadius: "24px",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--surface-elevated)",
            boxShadow: "var(--shadow-card-subtle)",
            padding: "28px 32px",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <span
                style={{
                  alignSelf: "flex-start",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  backgroundColor: "var(--badge-surface)",
                  color: "var(--badge-text)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Customize
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: "34px",
                  color: "var(--text-heading)",
                }}
              >
                Customize your agent
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                }}
              >
                Complete these four steps to get Aria ready for test calls. You
                can update settings anytime as your business evolves.
              </p>
            </div>
            <a
              href="#logout"
              onClick={handleLogout}
              style={{
                fontWeight: 600,
                color: "var(--brand-primary)",
                textDecoration: "none",
              }}
            >
              Log out
            </a>
          </header>

          <section
            style={{
              borderRadius: "18px",
              border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
              backgroundColor: "var(--surface-elevated)",
              padding: "24px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              maxWidth: "1080px",
              margin: "0 auto",
              boxShadow: "var(--shadow-card-subtle)",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.08em",
                }}
              >
                YOUR AGENT IS TRAINED ON
              </span>
              <span
                style={{ fontSize: "16px", color: "var(--text-secondary)" }}
              >
                No sources connected yet
              </span>
            </div>
            <button
              type="button"
              style={{
                border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                borderRadius: "999px",
                padding: "10px 20px",
                backgroundColor: "var(--surface-highlight)",
                color: "var(--brand-primary-strong)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </section>

          {!isGreetingStep ? (
            <section
              style={{
                borderRadius: "28px",
                backgroundColor: "var(--surface-elevated)",
                boxShadow: "var(--shadow-card-subtle)",
                border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                width: "100%",
                maxWidth: "1080px",
                margin: "0 auto",
              }}
            >
              <header
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    color: "var(--text-heading)",
                  }}
                >
                  {formStepCopy.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "15px",
                  }}
                >
                  {formStepCopy.description}
                </p>
              </header>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "28px",
                  maxWidth: "960px",
                  width: "100%",
                  margin: "0 auto",
                }}
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
                              color: FORM_FIELD_LABEL_COLOR,
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
                              backgroundColor: FORM_FIELD_ICON_BACKGROUND,
                              color: FORM_FIELD_ICON_COLOR,
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
                              ? `1px solid ${FORM_FIELD_ERROR_BORDER_COLOR}`
                              : `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                            padding: "16px 18px",
                            fontSize: "16px",
                            color: "var(--text-primary)",
                            outline: "none",
                            boxShadow: businessNameErrorMessage
                              ? FORM_FIELD_ERROR_GLOW
                              : "none",
                            backgroundColor: FORM_FIELD_BACKGROUND_COLOR,
                          }}
                        />
                      </label>
                      {businessNameErrorMessage ? (
                        <span
                          style={{
                            color: "var(--text-negative)",
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
                              color: FORM_FIELD_LABEL_COLOR,
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
                              backgroundColor: FORM_FIELD_ICON_BACKGROUND,
                              color: FORM_FIELD_ICON_COLOR,
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
                              ? `1px solid ${FORM_FIELD_ERROR_BORDER_COLOR}`
                              : `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                            padding: "16px 18px",
                            fontSize: "16px",
                            color: "var(--text-primary)",
                            outline: "none",
                            boxShadow: businessPhoneNumberErrorMessage
                              ? FORM_FIELD_ERROR_GLOW
                              : "none",
                            backgroundColor: FORM_FIELD_BACKGROUND_COLOR,
                          }}
                        />
                      </label>
                      {businessPhoneNumberErrorMessage ? (
                        <span
                          style={{
                            color: "var(--text-negative)",
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
                              color: FORM_FIELD_LABEL_COLOR,
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
                              backgroundColor: FORM_FIELD_ICON_BACKGROUND,
                              color: FORM_FIELD_ICON_COLOR,
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
                          placeholder="Explain what your business does, any specialties, and how you help customers."
                          value={businessOverview}
                          onChange={handleBusinessOverviewChange}
                          onBlur={() => setIsBusinessOverviewTouched(true)}
                          maxLength={BUSINESS_OVERVIEW_CHARACTER_LIMIT}
                          style={{
                            borderRadius: "18px",
                            border: businessOverviewErrorMessage
                              ? `1px solid ${FORM_FIELD_ERROR_BORDER_COLOR}`
                              : `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                            minHeight: "180px",
                            padding: "18px 20px",
                            fontSize: "16px",
                            color: "var(--text-primary)",
                            outline: "none",
                            resize: "vertical",
                            boxShadow: businessOverviewErrorMessage
                              ? FORM_FIELD_ERROR_GLOW
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
                        }}
                      >
                        {businessOverviewErrorMessage ? (
                          <span
                            style={{
                              color: "var(--text-negative)",
                              fontSize: "13px",
                            }}
                          >
                            {businessOverviewErrorMessage}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: FORM_FIELD_LABEL_COLOR,
                              fontSize: "13px",
                            }}
                          >
                            Share details about what makes your business unique.
                          </span>
                        )}
                        <span
                          style={{
                            color: FORM_FIELD_LABEL_COLOR,
                            fontSize: "13px",
                          }}
                        >
                          {businessOverview.length}/
                          {BUSINESS_OVERVIEW_CHARACTER_LIMIT}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}

                {formStepCopy.greetingCard ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        maxWidth: "640px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          color: "var(--text-heading)",
                        }}
                      >
                        {formStepCopy.greetingCard.highlightTitle}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                        }}
                      >
                        {formStepCopy.greetingCard.highlightDescription}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleNavigateToGreeting}
                      style={{
                        borderRadius: "999px",
                        border: "none",
                        background: "var(--brand-gradient)",
                        color: "var(--text-inverse)",
                        fontWeight: 700,
                        padding: "12px 28px",
                        boxShadow: "var(--shadow-elevated-strong)",
                        cursor: "pointer",
                      }}
                    >
                      {formStepCopy.greetingCard.primaryActionLabel}
                    </button>
                  </div>
                ) : null}
              </form>
            </section>
          ) : null}

          {isGreetingStep ? (
            <section
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
                maxWidth: "1080px",
                margin: "0 auto",
              }}
            >
              <article
                style={{
                  position: "relative",
                  borderRadius: "26px",
                  backgroundColor: "var(--surface-elevated)",
                  border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                  boxShadow: "var(--shadow-card-subtle)",
                  padding: "36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <header
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "14px",
                          background: "var(--card-gradient-strong)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-inverse)",
                          fontWeight: 700,
                          fontSize: "16px",
                        }}
                      >
                        4
                      </span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "22px",
                            color: "var(--text-heading)",
                            fontWeight: 700,
                          }}
                        >
                          Personalize Your Greeting
                        </h2>
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          Make a great first impression before you launch.
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <time
                        dateTime="PT2M"
                        style={{
                          borderRadius: "999px",
                          backgroundColor: "var(--surface-highlight)",
                          color: "var(--brand-primary-strong)",
                          fontWeight: 600,
                          fontSize: "13px",
                          padding: "6px 14px",
                        }}
                      >
                        2 min
                      </time>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "var(--text-secondary)",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "var(--text-positive)",
                            display: "inline-flex",
                          }}
                        />
                        Required
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-secondary)",
                      fontSize: "14px",
                      lineHeight: 1.65,
                    }}
                  >
                    Record or type the greeting callers hear when Aria answers.
                    A warm introduction sets expectations and keeps your brand
                    front-and-center from the first second.
                  </p>
                </header>

                <div
                  style={{
                    borderRadius: "20px",
                    border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                    background: "var(--surface-elevated)",
                    padding: "28px 26px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: FORM_FIELD_LABEL_COLOR,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {didChangeGreeting ? "GREETING" : "SAMPLE GREETING"}
                    </span>
                    {isEditingGreeting ? (
                      <textarea
                        value={greetingDraft}
                        onChange={(event) => {
                          setGreetingDraft(event.target.value);
                          setGreetingStatus("idle");
                          setDidChangeGreeting(
                            event.target.value.trim() !==
                              greetingOriginal.trim()
                          );
                        }}
                        rows={4}
                        maxLength={500}
                        style={{
                          borderRadius: "16px",
                          border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                          padding: "16px 18px",
                          fontSize: "15px",
                          color: "var(--text-primary)",
                          backgroundColor: FORM_FIELD_BACKGROUND_COLOR,
                          resize: "vertical",
                          minHeight: "140px",
                          outline: "none",
                        }}
                      />
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-primary)",
                          fontSize: "15px",
                          lineHeight: 1.7,
                          fontWeight: 600,
                        }}
                      >
                        "{greetingDraft}"
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: FORM_FIELD_LABEL_COLOR,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={hasRecordingDisclaimer}
                        onChange={handleRecordingDisclaimerToggle}
                        style={{
                          accentColor: "var(--brand-primary-strong)",
                          width: "16px",
                          height: "16px",
                        }}
                      />
                      Recording disclaimer included
                    </label>
                    <button
                      type="button"
                      onClick={handleResetGreeting}
                      style={{
                        borderRadius: "999px",
                        border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                        padding: "8px 18px",
                        backgroundColor: "var(--surface-highlight)",
                        color: "var(--brand-primary-strong)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handlePlayGreeting}
                      disabled={isPlayingGreeting}
                      style={{
                        borderRadius: "999px",
                        border: "none",
                        padding: "10px 24px",
                        background: "var(--brand-gradient)",
                        color: "var(--text-inverse)",
                        fontWeight: 600,
                        boxShadow: "var(--shadow-elevated-strong)",
                        cursor: isPlayingGreeting ? "not-allowed" : "pointer",
                        opacity: isPlayingGreeting ? 0.7 : 1,
                      }}
                    >
                      {isPlayingGreeting ? "Playing…" : "Play greeting"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRecordingDisclaimerUpdate}
                      style={{
                        borderRadius: "999px",
                        border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                        padding: "10px 24px",
                        backgroundColor: "var(--surface-highlight)",
                        color: "var(--brand-primary-strong)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Update recording disclaimer
                    </button>
                  </div>
                </div>

                <footer
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    color: FORM_FIELD_LABEL_COLOR,
                    fontSize: "13px",
                  }}
                >
                  <span>
                    Changes save automatically when you stop typing. Need ideas?
                    Try our sample greeting.
                  </span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={handleUseSampleGreeting}
                      style={{
                        borderRadius: "999px",
                        border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                        padding: "8px 18px",
                        backgroundColor: "var(--surface-highlight)",
                        color: "var(--brand-primary-strong)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Use sample greeting
                    </button>
                    <button
                      type="button"
                      onClick={handleEditGreeting}
                      style={{
                        borderRadius: "999px",
                        border: "none",
                        padding: "10px 22px",
                        background: "var(--brand-gradient)",
                        color: "var(--text-inverse)",
                        fontWeight: 600,
                        boxShadow: "var(--shadow-elevated-strong)",
                        cursor: "pointer",
                      }}
                    >
                      {isEditingGreeting ? "Save" : "Edit"}
                    </button>
                  </div>
                </footer>
              </article>

              <aside
                style={{
                  borderRadius: "22px",
                  border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                  backgroundColor: "var(--surface-elevated)",
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background: "var(--card-gradient-strong)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-inverse)",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    💡
                  </span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      color: "var(--text-heading)",
                      fontWeight: 700,
                    }}
                  >
                    Tips for a Great Greeting
                  </h3>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                  }}
                >
                  <li>Include your business name and agent name right away.</li>
                  <li>Set expectations about recording or next steps.</li>
                  <li>Invite the caller to share how you can help.</li>
                </ul>
              </aside>
            </section>
          ) : null}

          <section
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "28px",
              flexWrap: "wrap",
              width: "100%",
              maxWidth: "1080px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                borderRadius: "22px",
                padding: "18px 24px",
                background: "var(--surface-elevated)",
                border: `1px solid ${FORM_FIELD_BORDER_COLOR}`,
                flex: "0 1 360px",
                boxShadow: "var(--shadow-card-subtle)",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "48px",
                  borderRadius: "16px",
                  backgroundColor: "var(--surface-highlight)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-primary-strong)",
                  fontWeight: 700,
                }}
              >
                ▶
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--text-heading)",
                  }}
                >
                  Want to see more before setting up?
                </span>
                <span
                  style={{ fontSize: "14px", color: "var(--text-secondary)" }}
                >
                  Watch a quick tour here.
                </span>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
