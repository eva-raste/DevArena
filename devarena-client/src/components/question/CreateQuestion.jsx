/* eslint-disable no-unused-vars */
"use client"

import React, { useState, useEffect, useCallback } from "react"
import { generateUUID, slugify, validateQuestion } from "../../apis/question-utils"
import { createQuestion } from "../../apis/question-api"
import { QuestionForm } from "./QuestionForm"
import { LivePreview } from "./LivePreview"
import { JsonPreview } from "./JsonPreview"
import { PublishModal } from "./PublishModal"
import { CodeforcesPrefill } from "./CodeforcesPrefill"
import { AppToast } from "./AppToast"
import styles from "./css/CreateQuestion.module.css"
import { useNavigate } from "react-router-dom"
import { TestcaseImportBlock } from "./TestcaseImportBlock"
import { TestcaseSection } from "./TestcaseSection"
import { appendTestcasesWithLimit, normalizeOrder } from "@/utils/testcaseMerge"
import { QUESTION_TABS } from "@/types/question_tab"
import { getHiddenTestcaseLimit, getSampleTestcaseLimit } from "@/types/testcase"
import { ModifierManager } from "./ModifierManager"



const testcaseZipFormatGuide =
    `input/
    input1.txt
    input2.txt
output/
    output1.txt
    output2.txt`;

const CreateQuestion = ({ existingSlugs = [] }) => {
    const emptyState = {
        questionId: generateUUID(),
        questionSlug: "",
        title: "",
        description: "",
        difficulty: "",
        constraints: "",
        sampleTestcases: [],
        hiddenTestcases: [],
    }

    const [importedSampleTestcases, setImportedSampleTestcases] = useState(null)
    const [importedHiddenTestcases, setImportedHiddenTestcases] = useState(null)
    const sampleTestcaseLimit = getSampleTestcaseLimit();
    const hiddenTestcaseLimit = getHiddenTestcaseLimit();


    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState(QUESTION_TABS.DETAILS);

    const [question, setQuestion] = useState({ ...emptyState })
    const [errors, setErrors] = useState([])
    const [toast, setToast] = useState(null)
    const [showPublishModal, setShowPublishModal] = useState(false)
    const [slugWarning, setSlugWarning] = useState(false)
    const [lastAddedSampleId, setLastAddedSampleId] = useState(null)
    const [lastAddedHiddenId, setLastAddedHiddenId] = useState(null)
    const [modifiers, setModifiers] = useState([]);

    /* auto-generate slug */
    useEffect(() => {
        if (!question.title || question.questionSlug) return
        setQuestion(prev => ({
            ...prev,
            questionSlug: slugify(question.title),
        }))
    }, [question.title])

    /* slug conflict */
    useEffect(() => {
        setSlugWarning(
            question.questionSlug &&
            existingSlugs.includes(question.questionSlug)
        )
    }, [question.questionSlug, existingSlugs])

    const showToast = useCallback((message, type = "info") => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 2500)
    }, [])

    const handleInputChange = useCallback((field, value) => {
        setQuestion(prev => ({ ...prev, [field]: value }))
    }, [])

    /* ---------------- TESTCASE LOGIC ---------------- */

    // ---------- APPLY IMPORTED ----------

    const applyImportedSampleTestcases = useCallback(() => {
        if (!importedSampleTestcases?.length) return;

        const { merged, addedCount, droppedCount } =
            appendTestcasesWithLimit(
                question.sampleTestcases,
                importedSampleTestcases,
                sampleTestcaseLimit
            );

        setQuestion(prev => ({
            ...prev,
            sampleTestcases: merged,
        }));

        setImportedSampleTestcases(null);

        if (addedCount > 0) {
            showToast(`Added ${addedCount} sample testcase(s)`, "success");
        }

        if (droppedCount > 0) {
            showToast(
                `${droppedCount} sample testcase(s) dropped (limit: ${sampleTestcaseLimit})`,
                "warning"
            );
        }
    }, [
        question.sampleTestcases,
        importedSampleTestcases,
        showToast,
        sampleTestcaseLimit,
    ]);

    const applyImportedHiddenTestcases = useCallback(() => {
        if (!importedHiddenTestcases?.length) return;

        const { merged, addedCount, droppedCount } =
            appendTestcasesWithLimit(
                question.hiddenTestcases,
                importedHiddenTestcases,
                hiddenTestcaseLimit
            );

        setQuestion(prev => ({
            ...prev,
            hiddenTestcases: merged,
        }));

        setImportedHiddenTestcases(null);

        if (addedCount > 0) {
            showToast(`Added ${addedCount} hidden testcase(s)`, "success");
        }

        if (droppedCount > 0) {
            showToast(
                `${droppedCount} hidden testcase(s) dropped (limit: ${hiddenTestcaseLimit})`,
                "warning"
            );
        }
    }, [
        question.hiddenTestcases,
        importedHiddenTestcases,
        showToast,
        hiddenTestcaseLimit,
    ]);

    // ---------- CREATE ----------

    const createEmptyTestcase = (nextOrder) => ({
        order: nextOrder,
        input: "",
        output: "",
    });

    // ---------- ADD ----------



const handleAddTestcase = useCallback((type) => {
  setQuestion(prev => {
    const current = prev[type] ?? [];

    const limit =
      type === "sampleTestcases"
        ? sampleTestcaseLimit
        : hiddenTestcaseLimit;

    if (current.length >= limit) {
          showToast(`Maximum ${limit} ${type === "sampleTestcases" ? "sample" : "hidden"} testcases allowed`, "warning");

      return prev;
    }

    const nextOrder = current.length + 1;

    return {
      ...prev,
      [type]: [
        ...current,
        createEmptyTestcase(nextOrder),
      ],
    };
  });
}, []);


    // ---------- UPDATE ----------

    const handleUpdateTestcase = useCallback((type, order, field, value) => {
        setQuestion(prev => ({
            ...prev,
            [type]: prev[type].map(tc =>
                tc.order === order ? { ...tc, [field]: value } : tc
            ),
        }));
    }, []);

    // ---------- REMOVE ----------

    const handleRemoveTestcase = useCallback((type, order) => {
        setQuestion(prev => {
            const filtered = prev[type].filter(tc => tc.order !== order);

            const normalized = filtered.map((tc, index) => ({
                ...tc,
                order: index + 1,
            }));

            return {
                ...prev,
                [type]: normalized,
            };
        });
    }, []);

    // ---------- DUPLICATE ----------

    const handleDuplicateTestcase = useCallback((type, order) => {
        setQuestion(prev => {
            const list = [...prev[type]];
            const index = list.findIndex(tc => tc.order === order);
            if (index === -1) return prev;

            const clone = {
                ...list[index],
            };

            list.splice(index + 1, 0, clone);

            const normalized = list.map((tc, i) => ({
                ...tc,
                order: i + 1,
            }));

            return {
                ...prev,
                [type]: normalized,
            };
        });
    }, []);

    // ---------- MOVE ----------

    const handleMoveTestcase = useCallback((type, order, direction) => {
        setQuestion(prev => {
            const list = [...prev[type]];

            const index = list.findIndex(tc => tc.order === order);
            if (index === -1) return prev;

            const targetIndex =
                direction === "up" ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= list.length) {
                return prev;
            }

            const [item] = list.splice(index, 1);
            list.splice(targetIndex, 0, item);

            const normalized = list.map((tc, i) => ({
                ...tc,
                order: i + 1,
            }));

            return {
                ...prev,
                [type]: normalized,
            };
        });
    }, []);



    /* ---------------- VALIDATION / PUBLISH ---------------- */

    const handleValidate = useCallback(() => {
        const errs = validateQuestion(question)
        setErrors(errs)
        errs.length === 0
            ? showToast("Validation passed", "success")
            : showToast(`${errs.length} error(s) found`, "error")
    }, [question, showToast])

    const handlePublishClick = useCallback(() => {
        const errs = validateQuestion(question)
        if (errs.length) {
            setErrors(errs)
            showToast("Fix validation errors first", "error")
            return
        }
        setShowPublishModal(true)
    }, [question, showToast])

    const confirmPublish = useCallback(async () => {
        try {
            const payload = {
                ...question,
                modifierIds: modifiers.map(m => m.userId)
            };

            await createQuestion(payload);

            showToast("Question created", "success");
            setQuestion({ ...emptyState });
            setModifiers([]);
            navigate("/show-all-questions");
        } catch (e) {
            showToast("Publish failed", "error");
        }
    }, [question, modifiers, navigate, showToast]);


    return (
        <div className={`${styles.pageContainer} p-6 text-gray-100`}>
            <AppToast toast={toast} />

            <div className="flex gap-2 mb-6">
                {Object.values(QUESTION_TABS).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`
        px-4 py-2 rounded-xl font-medium transition-all
        ${activeTab === tab
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }
      `}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === QUESTION_TABS.DETAILS && (
                <React.Fragment>
                    <CodeforcesPrefill
                        onPrefillSuccess={(prefill) => {
                            setQuestion(prev => ({
                                ...prev,
                                ...prefill,
                                sampleTestcases: normalizeOrder(prefill.sampleTestcases),
                                hiddenTestcases: normalizeOrder(prefill.hiddenTestcases),
                            }));
                        }}
                    />
                    <QuestionForm
                        question={question}
                        errors={errors}
                        slugWarning={slugWarning}

                        onInputChange={handleInputChange}
                        onValidate={handleValidate}
                        onPublishClick={handlePublishClick}

                        
                    />

                    {showPublishModal && (
                        <PublishModal
                            question={question}
                            onClose={() => setShowPublishModal(false)}
                            onConfirm={confirmPublish}
                        />
                    )}
                </React.Fragment>

            )}

            {activeTab === QUESTION_TABS.TESTCASES && (
                <div className="space-y-6">
                    <div className="space-y-8">

                        <a href="/demo-testcases.zip"
                            download
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-muted text-foreground border border-border hover:bg-muted/80 hover:border-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4m0 0l4-4m-4 4V4" />
                            </svg>
                            Download Demo ZIP
                        </a>


                        <details className="text-sm text-muted-foreground mt-2">
                            <summary className="cursor-pointer">
                                Expected ZIP Structure
                            </summary>

                            <pre className="mt-2 bg-background border border-border rounded-lg p-3 text-xs overflow-auto">
                                {testcaseZipFormatGuide}
                            </pre>
                        </details>

                        {/* ZIP IMPORT + PREVIEW */}
                        <TestcaseImportBlock
                            title="Import Sample Testcases (ZIP)"
                            testcases={importedSampleTestcases}
                            onImport={setImportedSampleTestcases}
                            onApply={applyImportedSampleTestcases}
                            onError={(err) =>
                                showToast(err?.message || "ZIP upload failed", "error")
                            }
                        />

                        <TestcaseImportBlock
                            title="Import Hidden Testcases (ZIP)"
                            testcases={importedHiddenTestcases}
                            onImport={setImportedHiddenTestcases}
                            onApply={applyImportedHiddenTestcases}
                            onError={(err) =>
                                showToast(err?.message || "ZIP upload failed", "error")
                            }
                        />

                        {/* EXISTING EDITOR — TEMPORARY */}
                        <div className="border-t border-border pt-6 space-y-6">
                            <TestcaseSection
                                title="Sample Testcases"
                                type="sampleTestcases"
                                testcases={question.sampleTestcases ?? []}
                                onAdd={handleAddTestcase}
                                onMove={handleMoveTestcase}
                                onDuplicate={handleDuplicateTestcase}
                                onRemove={handleRemoveTestcase}
                                onUpdate={handleUpdateTestcase}
                                lastAddedId={lastAddedSampleId}
                            />

                            <TestcaseSection
                                title="Hidden Testcases"
                                type="hiddenTestcases"
                                testcases={question.hiddenTestcases ?? []}
                                onAdd={handleAddTestcase}
                                onMove={handleMoveTestcase}
                                onDuplicate={handleDuplicateTestcase}
                                onRemove={handleRemoveTestcase}
                                onUpdate={handleUpdateTestcase}
                                lastAddedId={lastAddedHiddenId}
                            />
                        </div>

                    </div>

                </div>
            )}

            {activeTab === QUESTION_TABS.PREVIEW && (
                <div className={styles.gridContainer}>
                    <LivePreview question={question} />
                    <JsonPreview
                      question={question}
                      modifiers={modifiers}
                    />

                </div>
            )}

            {activeTab === QUESTION_TABS.MODIFIER && (
                <ModifierManager
                    modifiers={modifiers}
                    setModifiers={setModifiers}
                />
            )}

        </div>

    )
}

export default CreateQuestion