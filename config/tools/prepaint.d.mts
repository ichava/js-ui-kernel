/** Where a surface's brand suffix goes in the fragment ("Browser" in the app). */
export const SUFFIX_SLOT: string;
/** The prepaint fragment without its leading documentation comment, its suffix slot filled. */
export function prepaintFragment(opts?: { suffix?: string }): string;
/** `html` with `fragment` inserted straight after the opening <body> tag. */
export function insertAfterBody(html: string, fragment: string): string;
/** Vite plugin: inline the prepaint into the listed pages (default index.html). */
export function injectPrepaint(opts?: { pages?: string[]; suffix?: string }): import('vite').Plugin;
/** Vite plugin: emit the fragment as `prepaint.html` beside the library bundle. */
export function emitPrepaint(opts?: { suffix?: string }): import('vite').Plugin;
