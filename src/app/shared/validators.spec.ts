import { FormControl } from '@angular/forms';
import { CustomValidators } from './validators';

describe('CustomValidators', () => {
  describe('uniprotAccession', () => {
    const validator = CustomValidators.uniprotAccession();

    describe('valid accessions', () => {
      it('should return null for empty value', () => {
        const control = new FormControl('');
        expect(validator(control)).toBeNull();
      });

      it('should validate standard UniProt accession P12345', () => {
        const control = new FormControl('P12345');
        expect(validator(control)).toBeNull();
      });

      it('should validate UniProt accession Q9Y6K9', () => {
        const control = new FormControl('Q9Y6K9');
        expect(validator(control)).toBeNull();
      });

      it('should validate UniProt accession O00141', () => {
        const control = new FormControl('O00141');
        expect(validator(control)).toBeNull();
      });

      it('should validate longer accession A0A0A0MRZ7', () => {
        const control = new FormControl('A0A0A0MRZ7');
        expect(validator(control)).toBeNull();
      });

      it('should validate lowercase input', () => {
        const control = new FormControl('p12345');
        expect(validator(control)).toBeNull();
      });

      it('should validate mixed case input', () => {
        const control = new FormControl('P12345');
        expect(validator(control)).toBeNull();
      });
    });

    describe('invalid accessions', () => {
      it('should reject invalid format', () => {
        const control = new FormControl('invalid');
        expect(validator(control)).toEqual({ invalidUniprot: true });
      });

      it('should reject too short accession', () => {
        const control = new FormControl('P123');
        expect(validator(control)).toEqual({ invalidUniprot: true });
      });

      it('should reject accession with spaces', () => {
        const control = new FormControl('P12 345');
        expect(validator(control)).toEqual({ invalidUniprot: true });
      });

      it('should reject accession with special characters', () => {
        const control = new FormControl('P12-345');
        expect(validator(control)).toEqual({ invalidUniprot: true });
      });

      it('should reject numeric only', () => {
        const control = new FormControl('123456');
        expect(validator(control)).toEqual({ invalidUniprot: true });
      });
    });
  });

  describe('fastaFormat', () => {
    const validator = CustomValidators.fastaFormat();

    describe('valid FASTA', () => {
      it('should return null for empty value', () => {
        const control = new FormControl('');
        expect(validator(control)).toBeNull();
      });

      it('should validate correct FASTA format', () => {
        const control = new FormControl('>header\nSEQUENCE');
        expect(validator(control)).toBeNull();
      });

      it('should validate FASTA with multiple lines', () => {
        const control = new FormControl('>header\nSEQUENCE\nMORESEQUENCE');
        expect(validator(control)).toBeNull();
      });

      it('should validate FASTA with description', () => {
        const control = new FormControl('>sp|P12345|PROT_HUMAN Protein description\nMKTVLQLL');
        expect(validator(control)).toBeNull();
      });

      it('should handle whitespace trimming', () => {
        const control = new FormControl('  >header\nSEQUENCE  ');
        expect(validator(control)).toBeNull();
      });
    });

    describe('invalid FASTA', () => {
      it('should reject sequence without header', () => {
        const control = new FormControl('SEQUENCE');
        expect(validator(control)).toEqual({ fastaNoHeader: true });
      });

      it('should reject header without sequence', () => {
        const control = new FormControl('>header');
        expect(validator(control)).toEqual({ fastaNoSequence: true });
      });

      it('should reject header with only empty lines', () => {
        const control = new FormControl('>header\n\n');
        expect(validator(control)).toEqual({ fastaNoSequence: true });
      });
    });
  });

  describe('minArrayLength', () => {
    it('should return null when array meets minimum length', () => {
      const validator = CustomValidators.minArrayLength(2);
      const control = new FormControl([1, 2, 3]);
      expect(validator(control)).toBeNull();
    });

    it('should return null when array equals minimum length', () => {
      const validator = CustomValidators.minArrayLength(2);
      const control = new FormControl([1, 2]);
      expect(validator(control)).toBeNull();
    });

    it('should return error when array is too short', () => {
      const validator = CustomValidators.minArrayLength(3);
      const control = new FormControl([1]);
      expect(validator(control)).toEqual({ minArrayLength: { required: 3, actual: 1 } });
    });

    it('should handle empty array', () => {
      const validator = CustomValidators.minArrayLength(1);
      const control = new FormControl([]);
      expect(validator(control)).toEqual({ minArrayLength: { required: 1, actual: 0 } });
    });

    it('should handle null value', () => {
      const validator = CustomValidators.minArrayLength(1);
      const control = new FormControl(null);
      expect(validator(control)).toEqual({ minArrayLength: { required: 1, actual: 0 } });
    });

    it('should handle undefined value', () => {
      const validator = CustomValidators.minArrayLength(1);
      const control = new FormControl(undefined);
      expect(validator(control)).toEqual({ minArrayLength: { required: 1, actual: 0 } });
    });

    it('should return null for minLength 0 with empty array', () => {
      const validator = CustomValidators.minArrayLength(0);
      const control = new FormControl([]);
      expect(validator(control)).toBeNull();
    });
  });

  describe('numberRange', () => {
    describe('valid values', () => {
      const validator = CustomValidators.numberRange(0, 100);

      it('should return null for value in range', () => {
        const control = new FormControl(50);
        expect(validator(control)).toBeNull();
      });

      it('should return null for minimum value', () => {
        const control = new FormControl(0);
        expect(validator(control)).toBeNull();
      });

      it('should return null for maximum value', () => {
        const control = new FormControl(100);
        expect(validator(control)).toBeNull();
      });

      it('should return null for empty value', () => {
        const control = new FormControl('');
        expect(validator(control)).toBeNull();
      });

      it('should return null for null value', () => {
        const control = new FormControl(null);
        expect(validator(control)).toBeNull();
      });
    });

    describe('invalid values', () => {
      const validator = CustomValidators.numberRange(0, 100);

      it('should return error for value below minimum', () => {
        const control = new FormControl(-1);
        expect(validator(control)).toEqual({ numberTooLow: { min: 0, actual: -1 } });
      });

      it('should return error for value above maximum', () => {
        const control = new FormControl(101);
        expect(validator(control)).toEqual({ numberTooHigh: { max: 100, actual: 101 } });
      });

      it('should return error for NaN', () => {
        const control = new FormControl('not a number');
        expect(validator(control)).toEqual({ notANumber: true });
      });
    });

    describe('different ranges', () => {
      it('should work with negative ranges', () => {
        const validator = CustomValidators.numberRange(-100, -10);
        expect(validator(new FormControl(-50))).toBeNull();
        expect(validator(new FormControl(0))).toEqual({ numberTooHigh: { max: -10, actual: 0 } });
      });

      it('should work with decimal values', () => {
        const validator = CustomValidators.numberRange(0.1, 0.9);
        expect(validator(new FormControl(0.5))).toBeNull();
        expect(validator(new FormControl(0.05))).toEqual({ numberTooLow: { min: 0.1, actual: 0.05 } });
      });
    });
  });

  describe('UNIPROT_PATTERN', () => {
    it('should be defined', () => {
      expect(CustomValidators.UNIPROT_PATTERN).toBeDefined();
    });

    it('should be a valid regex', () => {
      expect(CustomValidators.UNIPROT_PATTERN instanceof RegExp).toBeTruthy();
    });
  });
});
