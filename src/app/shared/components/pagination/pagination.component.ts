import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalItems = input(0);
  readonly pageSize = input(6);
  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const current = this.currentPage();
    const pages: (number | null)[] = [1];

    if (current > 3) pages.push(null);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(null);
    pages.push(total);

    return pages;
  });

  readonly showingFrom = computed(
    () => (this.currentPage() - 1) * this.pageSize() + 1,
  );
  readonly showingTo = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems()),
  );

  goTo(page: number | null): void {
    if (page === null || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  prev(): void {
    if (this.currentPage() > 1) this.pageChange.emit(this.currentPage() - 1);
  }

  next(): void {
    if (this.currentPage() < this.totalPages())
      this.pageChange.emit(this.currentPage() + 1);
  }
}
