import {Component, Inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WebService} from '../web.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatChipGrid, MatChipInput, MatChipRemove, MatChipRow} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatDivider} from '@angular/material/divider';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Subject, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface ShareFileDialogData {
  id: number;
  name: string;
  type: 'database' | 'msa' | 'structure';
  is_public: boolean;
  shared_with_usernames: string[];
}

@Component({
  selector: 'app-share-file-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatChipRemove,
    MatChipInput,
    MatSlideToggle,
    MatDivider
  ],
  templateUrl: './share-file-dialog.component.html',
  styleUrl: './share-file-dialog.component.scss'
})
export class ShareFileDialogComponent {
  private destroy$ = new Subject<void>();
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  sharedUsers = signal<string[]>([]);
  isPublic = signal<boolean>(false);

  form = this.fb.group({
    username: ['', Validators.required]
  });

  constructor(
    private dialogRef: MatDialogRef<ShareFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareFileDialogData,
    private fb: FormBuilder,
    private web: WebService,
    private sb: MatSnackBar
  ) {
    this.sharedUsers.set([...data.shared_with_usernames]);
    this.isPublic.set(data.is_public);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addUser(): void {
    const username = this.form.value.username?.trim();
    if (username && !this.sharedUsers().includes(username)) {
      this.sharedUsers.update(users => [...users, username]);
      this.form.reset();
    }
  }

  removeUser(username: string): void {
    this.sharedUsers.update(users => users.filter(u => u !== username));
  }

  togglePublic(): void {
    const newPublicState = !this.isPublic();
    const serviceCall = this.getSetPublicCall(newPublicState);

    serviceCall.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isPublic.set(newPublicState);
        this.sb.open(`File is now ${newPublicState ? 'public' : 'private'}`, 'Close', {duration: 2000});
      },
      error: (err: unknown) => {
        this.sb.open('Failed to update visibility', 'Close', {duration: 3000});
      }
    });
  }

  save(): void {
    const originalUsers = this.data.shared_with_usernames;
    const currentUsers = this.sharedUsers();

    const usersToAdd = currentUsers.filter(u => !originalUsers.includes(u));
    const usersToRemove = originalUsers.filter(u => !currentUsers.includes(u));

    const operations = [];

    if (usersToAdd.length > 0) {
      operations.push(
        this.getShareCall(usersToAdd).pipe(takeUntil(this.destroy$))
      );
    }

    if (usersToRemove.length > 0) {
      operations.push(
        this.getUnshareCall(usersToRemove).pipe(takeUntil(this.destroy$))
      );
    }

    if (operations.length === 0) {
      this.dialogRef.close(true);
      return;
    }

    let completed = 0;
    operations.forEach(op => {
      op.subscribe({
        next: () => {
          completed++;
          if (completed === operations.length) {
            this.sb.open('Sharing settings updated', 'Close', {duration: 2000});
            this.dialogRef.close(true);
          }
        },
        error: (err: unknown) => {
          this.sb.open('Failed to update sharing settings', 'Close', {duration: 3000});
        }
      });
    });
  }

  private getShareCall(usernames: string[]): Observable<unknown> {
    switch (this.data.type) {
      case 'database':
        return this.web.shareFastaDatabase(this.data.id, usernames);
      case 'msa':
        return this.web.shareMSA(this.data.id, usernames);
      case 'structure':
        return this.web.shareStructure(this.data.id, usernames);
    }
  }

  private getUnshareCall(usernames: string[]): Observable<unknown> {
    switch (this.data.type) {
      case 'database':
        return this.web.unshareFastaDatabase(this.data.id, usernames);
      case 'msa':
        return this.web.unshareMSA(this.data.id, usernames);
      case 'structure':
        return this.web.unshareStructure(this.data.id, usernames);
    }
  }

  private getSetPublicCall(isPublic: boolean): Observable<unknown> {
    switch (this.data.type) {
      case 'database':
        return this.web.setFastaDatabasePublic(this.data.id, isPublic);
      case 'msa':
        return this.web.setMSAPublic(this.data.id, isPublic);
      case 'structure':
        return this.web.setStructurePublic(this.data.id, isPublic);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
