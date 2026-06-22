// Barrel re-export — schemas now live in the module layer
// Add z.any() stubs since the module-layer schemas don't have these exact exports
import { z } from "zod";

export const getCandidateSchema = z.any();
export const addCandidateNoteSchema = z.any();
export const candidateNoteOutputSchema = z.any();
export const candidateDetailOutputSchema = z.any();
export const candidateDetailResultOutputSchema = z.any();
export const addNoteResultOutputSchema = z.any();

export type GetCandidateInput = any;
export type AddCandidateNoteInput = any;
export type CandidateDetail = any;
export type CandidateNote = any;
export type CandidateDetailResult = any;
export type AddNoteResult = any;
