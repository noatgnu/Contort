import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { WebService } from '../web.service';

export interface FilePreviewData {
  id: number;
  fileName: string;
  fileType: 'database' | 'msa' | 'structure';
}

interface FastaSequence {
  name: string;
  length: number;
}

@Component({
  selector: 'app-file-preview-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './file-preview-dialog.component.html',
  styleUrl: './file-preview-dialog.component.scss'
})
export class FilePreviewDialogComponent {
  content = signal<string>('');
  sequenceCount = signal<number>(0);
  sequences = signal<FastaSequence[]>([]);
  lineCount = signal<number>(0);
  fileSize = signal<string>('');
  isLoading = signal<boolean>(true);

  private readonly MAX_LINES = 100;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FilePreviewData,
    private dialogRef: MatDialogRef<FilePreviewDialogComponent>,
    private web: WebService
  ) {
    this.loadFileContent();
  }

  private loadFileContent(): void {
    this.web.previewFile(this.data.id, this.data.fileType).subscribe({
      next: (content) => {
        this.processContent(content);
        this.isLoading.set(false);
      },
      error: () => {
        this.content.set('Failed to load file content');
        this.isLoading.set(false);
      }
    });
  }

  private processContent(fullContent: string): void {
    const lines = fullContent.split('\n');
    this.lineCount.set(lines.length);
    this.fileSize.set(this.formatFileSize(fullContent.length));

    const previewLines = lines.slice(0, this.MAX_LINES);
    let preview = previewLines.join('\n');
    if (lines.length > this.MAX_LINES) {
      preview += `\n\n... (${lines.length - this.MAX_LINES} more lines)`;
    }
    this.content.set(preview);

    if (this.data.fileType === 'database' || this.data.fileType === 'msa') {
      this.parseFasta(fullContent);
    }
  }

  private parseFasta(content: string): void {
    const lines = content.split('\n');
    const sequences: FastaSequence[] = [];
    let currentName = '';
    let currentLength = 0;

    for (const line of lines) {
      if (line.startsWith('>')) {
        if (currentName) {
          sequences.push({ name: currentName, length: currentLength });
        }
        currentName = line.slice(1).split(' ')[0];
        currentLength = 0;
      } else {
        currentLength += line.trim().length;
      }
    }

    if (currentName) {
      sequences.push({ name: currentName, length: currentLength });
    }

    this.sequenceCount.set(sequences.length);
    this.sequences.set(sequences.slice(0, 10));
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  close(): void {
    this.dialogRef.close();
  }
}
