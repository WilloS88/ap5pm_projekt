import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
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
import { closeOutline, star, starOutline } from "ionicons/icons";

@Component({
	selector: "app-tab1",
	standalone: true,
	templateUrl: "tab1.page.html",
	styleUrls: ["tab1.page.scss"],
	imports: [
		CommonModule,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
		IonRefresher,
		IonRefresherContent,
		IonSpinner,
		IonButton,
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
		IonHeader,
		IonModal,
		IonButtons,
		IonList,
		IonItem,
		IonLabel,
		IonText,
	],
})
export class Tab1Page implements OnInit {
	movies: TmdbMovie[] = [];
	loading = false;
	errorMessage: string | null = null;

	detailOpen = false;
	detailLoading = false;
	detail: TmdbMovieDetail | null = null;

	constructor(public tmdb: TmdbService, private favs: FavoritesService) {
		addIcons({ closeOutline, star, starOutline });
	}

	ngOnInit() {
		this.loadRandom();
	}

	loadRandom(event?: any) {
		if (!event) {
			this.loading = true;
		}
		this.errorMessage = null;

		this.tmdb.getRandomCatalog().subscribe({
			next: (res) => {
				this.movies = res.results;
				this.loading = false;
				if (event) {
					console.log("success");
					event.target.complete();
				}
			},
			error: (err) => {
				console.error(err);
				this.errorMessage = "Failed to load movies.";
				this.loading = false;
				if (event) {
					event.target.complete();
				}
			},
		});
	}

	poster(movie: TmdbMovie) {
		return this.tmdb.img(movie.poster_path);
	}

	doRefresh(ev: any) {
		this.loadRandom(ev);
	}

	getDirectors(detail: TmdbMovieDetail | null): string {
		if (!detail || !detail.credits || !detail.credits.crew) {
			return "Unknown";
		}

		const names = detail.credits.crew.filter((c) => c.job === "Director").map((c) => c.name);

		return names.length ? names.join(", ") : "Unknown";
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

	isFavorite(movie: TmdbMovie | TmdbMovieDetail | null | undefined): boolean {
		if (!movie) return false;
		return this.favs.isFavorite(movie.id);
	}

	toggleFavorite(movie: TmdbMovie | TmdbMovieDetail | null | undefined, ev?: Event) {
		if (ev) ev.stopPropagation();
		if (!movie) return;
		this.favs.toggle(movie);
	}
}
