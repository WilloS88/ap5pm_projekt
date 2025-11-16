import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonSearchbar,
	IonButton,
	IonRefresher,
	IonRefresherContent,
	IonSpinner,
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonCardHeader,
	IonCardTitle,
	IonCardSubtitle,
	IonCardContent,
	IonImg,
	IonIcon,
	IonModal,
	IonButtons,
	IonList,
	IonItem,
	IonLabel,
	IonText,
} from "@ionic/angular/standalone";
import { TmdbService, TmdbMovie, TmdbMovieDetail } from "../services/tmdb.service";
import { FavoritesService } from "../services/favorites.service";
import { addIcons } from "ionicons";
import { closeOutline, searchOutline, star, starOutline } from "ionicons/icons";

type SearchType = "title" | "director" | null;

@Component({
	selector: "app-tab2",
	standalone: true,
	templateUrl: "tab2.page.html",
	styleUrls: ["tab2.page.scss"],
	imports: [
		CommonModule,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
		IonSearchbar,
		IonButton,
		IonRefresher,
		IonRefresherContent,
		IonSpinner,
		IonGrid,
		IonRow,
		IonCol,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardSubtitle,
		IonCardContent,
		IonImg,
		IonIcon,
		IonModal,
		IonButtons,
		IonList,
		IonItem,
		IonLabel,
		IonText,
	],
})
export class Tab2Page {
	titleQuery = "";
	directorQuery = "";

	movies: TmdbMovie[] = [];
	loading = false;
	errorMessage: string | null = null;

	lastSearch: SearchType = null;

	page = 1;
	totalPages = 1;
	private readonly pageSize = 20;
	private directorAllMovies: TmdbMovie[] = [];

	detailOpen = false;
	detailLoading = false;
	detail: TmdbMovieDetail | null = null;

	constructor(public tmdb: TmdbService, private favs: FavoritesService) {
		addIcons({ closeOutline, searchOutline, star, starOutline });
	}

	// ***** INPUT HANDLERS *****

	onTitleSearch(ev: CustomEvent) {
		this.titleQuery = (ev.detail.value || "").toString();
		this.lastSearch = "title";
		this.page = 1;
		this.searchByTitle();
	}

	onDirectorSearch(ev: CustomEvent) {
		this.directorQuery = (ev.detail.value || "").toString();
		this.lastSearch = "director";
		this.page = 1;
		this.searchByDirector();
	}

	onTitleClear() {
		this.titleQuery = "";
		this.movies = [];
		this.errorMessage = null;
		this.lastSearch = null;
	}

	onDirectorClear() {
		this.directorQuery = "";
		this.movies = [];
		this.errorMessage = null;
		this.lastSearch = null;
	}

	// ***** SEARCH BY TITLE *****

	private searchByTitle(event?: any) {
		const q = this.titleQuery.trim();
		if (!q) {
			this.movies = [];
			this.errorMessage = null;
			this.totalPages = 1;
			if (event) event.target.complete();
			return;
		}

		if (!event) {
			this.loading = true;
		}
		this.errorMessage = null;

		this.tmdb.searchMovies(q, 1).subscribe({
			next: (res) => {
				this.movies = res.results || [];
				this.totalPages = res.total_pages || 1;
				this.loading = false;
				if (event) event.target.complete();
			},
			error: (err) => {
				console.error(err);
				this.errorMessage = "Failed to load search results.";
				this.loading = false;
				if (event) event.target.complete();
			},
		});
	}

	// ***** SEARCH BY DIRECTOR *****

	private searchByDirector(event?: any) {
		const q = this.directorQuery.trim();
		if (!q) {
			this.movies = [];
			this.errorMessage = null;
			this.directorAllMovies = [];
			this.totalPages = 1;
			if (event) event.target.complete();
			return;
		}

		if (!event) {
			this.loading = true;
		}
		this.errorMessage = null;

		this.tmdb.searchPerson(q).subscribe({
			next: (res) => {
				const persons = Array.isArray(res?.results) ? res.results : [];

				if (!persons.length) {
					this.movies = [];
					this.directorAllMovies = [];
					this.errorMessage = `No director found for "${q}".`;
					this.loading = false;
					if (event) event.target.complete();
					return;
				}

				const director =
					persons.find((p: any) => p.known_for_department === "Directing" || p.department === "Directing") ??
					persons[0];

				console.log("Chosen person for director search:", director, persons);

				this.tmdb.getPersonMovies(director.id).subscribe({
					next: (credits) => {
						const crew = Array.isArray(credits?.crew) ? credits.crew : [];

						let directorMovies = crew.filter((c: any) => c.job === "Director");

						if (!directorMovies.length) {
							directorMovies = crew.filter(
								(c: any) => c.department === "Directing" || c.known_for_department === "Directing"
							);
						}

						if (!directorMovies.length) {
							directorMovies = crew;
						}

						this.movies = directorMovies as TmdbMovie[];

						this.loading = false;
						if (event) event.target.complete();
					},
					error: (err) => {
						console.error(err);
						this.errorMessage = "Failed to load director movies.";
						this.loading = false;
						if (event) event.target.complete();
					},
				});
			},
			error: (err) => {
				console.error(err);
				this.errorMessage = "Failed to search person.";
				this.loading = false;
				if (event) event.target.complete();
			},
		});
	}

	private applyDirectorPage() {
		const all = this.directorAllMovies || [];
		const total = Math.max(1, Math.ceil(all.length / this.pageSize));
		this.totalPages = total;
		if (this.page > total) this.page = total;
		if (this.page < 1) this.page = 1;

		const start = (this.page - 1) * this.pageSize;
		const end = start + this.pageSize;
		this.movies = all.slice(start, end);
	}

	// ***** COMMON *****

	doRefresh(ev: any) {
		if (this.lastSearch === "title") {
			this.searchByTitle(ev);
		} else if (this.lastSearch === "director") {
			this.searchByDirector(ev);
		} else {
			ev.target.complete();
		}
	}

	retrySearch() {
		if (this.lastSearch === "title") {
			this.searchByTitle();
		} else if (this.lastSearch === "director") {
			this.searchByDirector();
		}
	}

	poster(movie: TmdbMovie) {
		return this.tmdb.img(movie.poster_path);
	}

	openDetail(movie: TmdbMovie) {
		this.detailOpen = true;
		this.detailLoading = true;
		this.detail = null;

		this.tmdb.getMovieDetail(movie.id).subscribe({
			next: (d) => {
				this.detail = d;
			},
			error: (err) => {
				console.error(err);
				this.detailLoading = false;
			},
			complete: () => {
				this.detailLoading = false;
			},
		});
	}

	closeDetail() {
		this.detailOpen = false;
		this.detail = null;
	}

	getDirectors(detail: TmdbMovieDetail | null): string {
		if (!detail || !detail.credits || !detail.credits.crew) {
			return "Unknown";
		}

		const names = detail.credits.crew.filter((c) => c.job === "Director").map((c) => c.name);
		return names.length ? names.join(", ") : "Unknown";
	}

	isFavorite(movie: TmdbMovie | TmdbMovieDetail | null | undefined): boolean {
		if (!movie) return false;
		return this.favs.isFavorite(movie.id);
	}

	toggleFavorite(movie: TmdbMovie | TmdbMovieDetail | null | undefined, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
		}
		if (!movie) return;
		this.favs.toggle(movie);
	}

	nextPage() {
		if (this.page >= this.totalPages) return;
		this.page++;
		if (this.lastSearch === "title") {
			this.searchByTitle();
		} else if (this.lastSearch === "director") {
			this.applyDirectorPage();
		}
	}

	prevPage() {
		if (this.page <= 1) return;
		this.page--;
		if (this.lastSearch === "title") {
			this.searchByTitle();
		} else if (this.lastSearch === "director") {
			this.applyDirectorPage();
		}
	}
}
