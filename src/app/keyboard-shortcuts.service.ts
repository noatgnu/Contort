import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { KeyboardShortcutsDialogComponent } from './shared/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private enabled = true;

  readonly shortcuts: KeyboardShortcut[] = [
    { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
    { key: 'Escape', description: 'Close dialog / Clear selection', category: 'General' },
    { key: 'g then h', description: 'Go to Dashboard', category: 'Navigation' },
    { key: 'g then j', description: 'Go to Jobs', category: 'Navigation' },
    { key: 'g then v', description: 'Go to Visualization', category: 'Navigation' },
    { key: 'n', description: 'New job (on jobs page)', category: 'Actions' },
    { key: '/', description: 'Focus search input', category: 'Actions' }
  ];

  private pendingKey: string | null = null;
  private pendingTimeout: any = null;

  handleKeydown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const target = event.target as HTMLElement;
    const isInputElement = target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (this.pendingKey === 'g') {
      this.handleGSequence(event);
      return;
    }

    if (event.key === '?' && !isInputElement) {
      event.preventDefault();
      this.showShortcutsDialog();
      return;
    }

    if (event.key === 'Escape') {
      this.closeAllDialogs();
      return;
    }

    if (event.key === 'g' && !isInputElement) {
      this.pendingKey = 'g';
      this.pendingTimeout = setTimeout(() => {
        this.pendingKey = null;
      }, 1000);
      return;
    }

    if (event.key === '/' && !isInputElement) {
      event.preventDefault();
      this.focusSearchInput();
      return;
    }

    if (event.key === 'n' && !isInputElement) {
      const currentUrl = this.router.url;
      if (currentUrl.includes('/consurf-job')) {
        this.router.navigate(['/consurf-job']);
      }
      return;
    }
  }

  private handleGSequence(event: KeyboardEvent): void {
    this.clearPendingKey();

    switch (event.key) {
      case 'h':
        event.preventDefault();
        this.router.navigate(['/dashboard']);
        break;
      case 'j':
        event.preventDefault();
        this.router.navigate(['/consurf-job']);
        break;
      case 'v':
        event.preventDefault();
        this.router.navigate(['/consurf-view']);
        break;
    }
  }

  private clearPendingKey(): void {
    this.pendingKey = null;
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
  }

  showShortcutsDialog(): void {
    this.dialog.open(KeyboardShortcutsDialogComponent, {
      width: '500px'
    });
  }

  private closeAllDialogs(): void {
    this.dialog.closeAll();
  }

  private focusSearchInput(): void {
    const searchInput = document.querySelector('input[formcontrolname="searchTerm"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}
