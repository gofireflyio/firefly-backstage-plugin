// Import necessary testing utilities
import { numberWithCommas, capitalize } from './common';

/**
 * Test suite for common utility functions
 */
describe('common utilities', () => {
    /**
     * Tests for numberWithCommas function
     */
    describe('numberWithCommas', () => {
        // Test case for whole numbers
        it('should format whole numbers correctly', () => {
            expect(numberWithCommas('1234')).toBe('1,234');
            expect(numberWithCommas('1000000')).toBe('1,000,000');
            expect(numberWithCommas('0')).toBe('0');
        });

        // Test case for decimal numbers
        it('should format decimal numbers correctly', () => {
            expect(numberWithCommas('1234.56')).toBe('1,234.56');
            expect(numberWithCommas('1000000.789')).toBe('1,000,000.79');
            expect(numberWithCommas('0.1')).toBe('0.10');
        });

        // Test case for small decimal numbers
        it('should handle small decimal numbers correctly', () => {
            expect(numberWithCommas('0.01')).toBe('0.01');
            expect(numberWithCommas('0.001')).toBe('0');
        });

        // Test case for string numbers
        it('should handle string number inputs correctly', () => {
            expect(numberWithCommas('1234567.89')).toBe('1,234,567.89');
            expect(numberWithCommas('.5')).toBe('0.50');
        });

        // Test case for edge cases
        it('should handle edge cases correctly', () => {
            expect(numberWithCommas('-1234.56')).toBe('-1,234.56');
            expect(numberWithCommas('0.00')).toBe('0');
        });
    });

    /**
     * Tests for capitalize function
     */
    describe('capitalize', () => {
        it('should capitalize first letter of a word', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('world')).toBe('World');
        });

        it('should handle already capitalized words', () => {
            expect(capitalize('Hello')).toBe('Hello');
            expect(capitalize('World')).toBe('World');
        });

        it('should handle empty strings', () => {
            expect(capitalize('')).toBe('');
        });

        it('should handle single character strings', () => {
            expect(capitalize('a')).toBe('A');
            expect(capitalize('z')).toBe('Z');
        });

        it('should only capitalize first letter of multiple words', () => {
            expect(capitalize('hello world')).toBe('Hello world');
        });
    });
}); 