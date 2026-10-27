/**
 * Brendan's Stay22 account id (aid): the single source of truth.
 *
 * Kept in a plain module, not in a 'use client' file. A server component that
 * imports a value from a 'use client' module receives a client reference, not
 * the value, so links rendered on the server got a broken aid (found
 * 2026-10-26 on the resort and compare pages). Both the browser script loader
 * and the server-side link builder import from here.
 */
export const STAY22_AID = '6a4fa10b1b2dc574185e339d';
