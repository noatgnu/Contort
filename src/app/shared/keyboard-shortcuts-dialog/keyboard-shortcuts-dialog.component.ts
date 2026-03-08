import { Component, inject } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { KeyboardShortcutsService, KeyboardShortcut } from '../../keyboard-shortcuts.service';

@Component({
  selector: 'app-keyboard-shortcuts-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIcon
  ],
  templateUrl: './keyboard-shortcuts-dialog.component.html',
  styleUrl: './keyboard-shortcuts-dialog.component.scss'
})
export class KeyboardShortcutsDialogComponent {
  private shortcutsService = inject(KeyboardShortcutsService);

  get shortcuts(): KeyboardShortcut[] {
    return this.shortcutsService.shortcuts;
  }

  get categories(): string[] {
    return [...new Set(this.shortcuts.map(s => s.category))];
  }

  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.shortcuts.filter(s => s.category === category);
  }
}
