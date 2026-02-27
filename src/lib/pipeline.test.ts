import { describe, it, expect } from "vitest";
import { createInitialPipelineState } from "./pipeline";
import { PIPELINE_STEPS } from "./constants";

describe("createInitialPipelineState", () => {
    it("should initialize with default idle state", () => {
        const state = createInitialPipelineState();
        expect(state.status).toBe("idle");
        expect(state.id).toContain("pipeline-");
        expect(state.steps.length).toBe(PIPELINE_STEPS.length);
        expect(state.currentStepIndex).toBe(-1);
        expect(state.generatedFiles).toEqual({});
        expect(state.reviewIteration).toBe(0);
        expect(state.chatMessages).toEqual([]);
    });

    it("should set all steps to pending status initially", () => {
        const state = createInitialPipelineState();
        state.steps.forEach(step => {
            expect(step.status).toBe("pending");
            expect(step.progress).toBe(0);
        });
    });
});
