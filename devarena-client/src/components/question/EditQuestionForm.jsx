/* eslint-disable no-unused-vars */
"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchEditQuestionCard, fetchQuestionCard, updateQuestionApi } from "@/apis/question-api"
import { QuestionForm } from "./QuestionForm"
import { appendTestcasesWithLimit, normalizeOrder } from "@/utils/testcaseMerge"
import { validateQuestion } from "@/apis/question-utils"
import { QUESTION_TABS } from "@/types/question_tab"
import { getHiddenTestcaseLimit, getSampleTestcaseLimit } from "@/types/testcase"
import { LivePreview } from "./LivePreview"
import { TestcaseImportBlock } from "./TestcaseImportBlock"
import { TestcaseSection } from "./TestcaseSection"
import { AppToast } from "./AppToast"


export default function EditQuestionForm() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [question, setQuestion] = useState({
    title: "",
    questionSlug: "",
    description: "",
    difficulty: null,
    constraints: "",
    sampleTestcases: [],
    hiddenTestcases: [],
  })

  const [activeTab, setActiveTab] = useState(QUESTION_TABS.DETAILS);
  const [importedSampleTestcases, setImportedSampleTestcases] = useState(null);
  const [importedHiddenTestcases, setImportedHiddenTestcases] = useState(null);
  const sampleTestcaseLimit = getSampleTestcaseLimit();
  const hiddenTestcaseLimit = getHiddenTestcaseLimit();

  const [errors, setErrors] = useState([])
  const [slugWarning, setSlugWarning] = useState(false)
  const [showConstraintsGuide, setShowConstraintsGuide] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  

  /* ================== FETCH ================== */
  useEffect(() => {
    const load = async () => {
      // console.log("Calling api")
      const q = await fetchEditQuestionCard(slug)
      // console.log(q);
      setQuestion({
        ...q,
        sampleTestcases: normalizeOrder(q.sampleTestcases),
        hiddenTestcases: normalizeOrder(q.hiddenTestcases),
      });
      setLoading(false)
    }

    load()
  }, [slug])

  const showToast = useCallback((message, type = "info") => {
          setToast({ message, type })
          setTimeout(() => setToast(null), 2500)
      }, [])

  const handleBackendError = (err) => {
    const status = err.response?.status
    const message = err.response?.data?.message

    if (
      status === 409 &&
      message === "QUESTION_SLUG_ALREADY_EXISTS"
    ) {
      setSlugWarning(true)
      setErrors(["Question slug already exists"])
      return
    }

    setErrors([message || "Something went wrong"])
  }


  /* ================== GENERIC FIELD UPDATE ================== */
  const onInputChange = useCallback((field, value) => {
    setQuestion((prev) => ({ ...prev, [field]: value }))

    if (field === "questionSlug") {
      setSlugWarning(false)
      setErrors((errs) =>
        errs.filter((e) => e !== "Question slug already exists")
      )
    }
  }, [])


  /* ================== CONSTRAINTS GUIDE ================== */
  const onToggleConstraintsGuide = () =>
    setShowConstraintsGuide((v) => !v)

  /* ================== TESTCASES ================== */

  const createEmptyTestcase = (nextOrder) => ({
    order: nextOrder,
    input: "",
    output: "",
  });

  const onAddTestcase = (type) => {
    setQuestion(prev => {
      const nextOrder = prev[type].length + 1;
      return {
        ...prev,
        [type]: [...prev[type], createEmptyTestcase(nextOrder)],
      };
    });
  };

  const onUpdateTestcase = (type, order, field, value) => {
    setQuestion(prev => ({
      ...prev,
      [type]: prev[type].map(tc =>
        tc.order === order ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  const onRemoveTestcase = (type, order) => {
    setQuestion(prev => {
      const filtered = prev[type].filter(tc => tc.order !== order);
      const normalized = filtered.map((tc, i) => ({
        ...tc,
        order: i + 1,
      }));
      return { ...prev, [type]: normalized };
    });
  };

  const onDuplicateTestcase = (type, order) => {
    setQuestion(prev => {
      const list = [...prev[type]];
      const index = list.findIndex(tc => tc.order === order);
      if (index === -1) return prev;

      list.splice(index + 1, 0, { ...list[index] });

      const normalized = list.map((tc, i) => ({
        ...tc,
        order: i + 1,
      }));

      return { ...prev, [type]: normalized };
    });
  };

  const onMoveTestcase = (type, order, direction) => {
    setQuestion(prev => {
      const list = [...prev[type]];
      const index = list.findIndex(tc => tc.order === order);
      if (index === -1) return prev;

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;

      const [item] = list.splice(index, 1);
      list.splice(target, 0, item);

      const normalized = list.map((tc, i) => ({
        ...tc,
        order: i + 1,
      }));

      return { ...prev, [type]: normalized };
    });
  };

  const applyImportedSampleTestcases = () => {
    if (!importedSampleTestcases?.length) return;

    const { merged } = appendTestcasesWithLimit(
      question.sampleTestcases,
      importedSampleTestcases,
      sampleTestcaseLimit
    );

    setQuestion(prev => ({
      ...prev,
      sampleTestcases: merged,
    }));

    setImportedSampleTestcases(null);
  };

  const applyImportedHiddenTestcases = () => {
    if (!importedHiddenTestcases?.length) return;

    const { merged } = appendTestcasesWithLimit(
      question.hiddenTestcases,
      importedHiddenTestcases,
      hiddenTestcaseLimit
    );

    setQuestion(prev => ({
      ...prev,
      hiddenTestcases: merged,
    }));

    setImportedHiddenTestcases(null);
  };



  /* ================== SAVE ================== */
  const onSaveDraft = async () => {
    // await updateQuestionApi(slug, question)
    // navigate("/show-all-questions")
  }

  const onValidate = useCallback(() => {
          const errs = validateQuestion(question)
          setErrors(errs)
          errs.length === 0
              ? showToast("Validation passed", "success")
              : showToast(`${errs.length} error(s) found`, "error")
      }, [question, showToast])

  const onPublishClick = async () => {
    console.log(slug);
    onValidate()
    try {
      setErrors([])
      setSlugWarning(false)

      await updateQuestionApi(slug, question)
      navigate("/show-all-questions")
    } catch (err) {
      handleBackendError(err)
    }
  }

  if (loading || !question) return <div className="p-10">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <AppToast toast={toast} />
      {/* Tabs */}
      <div className="flex gap-2">
        {Object.values(QUESTION_TABS).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* DETAILS */}
      {activeTab === QUESTION_TABS.DETAILS && (
        <QuestionForm
          question={question}
          errors={errors}
          slugWarning={slugWarning}
          showConstraintsGuide={showConstraintsGuide}
          onInputChange={onInputChange}
          onToggleConstraintsGuide={onToggleConstraintsGuide}
          
          onSaveDraft={onSaveDraft}
          onValidate={onValidate}
          onPublishClick={onPublishClick}
        />
      )}

      {/* TESTCASES */}
      {activeTab === QUESTION_TABS.TESTCASES && (
        <div className="space-y-8">

          <TestcaseImportBlock
            title="Import Sample Testcases (ZIP)"
            testcases={importedSampleTestcases}
            onImport={setImportedSampleTestcases}
            onApply={applyImportedSampleTestcases}
          />

          <TestcaseImportBlock
            title="Import Hidden Testcases (ZIP)"
            testcases={importedHiddenTestcases}
            onImport={setImportedHiddenTestcases}
            onApply={applyImportedHiddenTestcases}
          />

          <TestcaseSection
            title="Sample Testcases"
            type="sampleTestcases"
            testcases={question.sampleTestcases}
            onAdd={onAddTestcase}
            onMove={onMoveTestcase}
            onDuplicate={onDuplicateTestcase}
            onRemove={onRemoveTestcase}
            onUpdate={onUpdateTestcase}
          />

          <TestcaseSection
            title="Hidden Testcases"
            type="hiddenTestcases"
            testcases={question.hiddenTestcases}
            onAdd={onAddTestcase}
            onMove={onMoveTestcase}
            onDuplicate={onDuplicateTestcase}
            onRemove={onRemoveTestcase}
            onUpdate={onUpdateTestcase}
          />

        </div>
      )}

      {/* PREVIEW */}
      {activeTab === QUESTION_TABS.PREVIEW && (
        <LivePreview question={question} />
      )}

    </div>
  );

}
