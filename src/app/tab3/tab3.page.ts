import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
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
	IonButton,
	IonModal,
	IonButtons,
	IonList,
	IonItem,
	IonLabel,
	IonText,
	IonSpinner,
} from "@ionic/angular/standalone";
import { TmdbService, TmdbMovie, TmdbMovieDetail } from "../services/tmdb.service";
import { FavoritesService } from "../services/favorites.service";
import { addIcons } from "ionicons";
import { closeOutline, star, starOutline } from "ionicons/icons";

@Component({
	selector: "app-tab3",
	standalone: true,
	templateUrl: "tab3.page.html",
	styleUrls: ["tab3.page.scss"],
	imports: [
		CommonModule,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
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
		IonButton,
		IonModal,
		IonButtons,
		IonList,
		IonItem,
		IonLabel,
		IonText,
		IonSpinner,
	],
})
export class Tab3Page implements OnInit {
	favorites: TmdbMovie[] = [];

	allFavorites: TmdbMovie[] = [];
	page 				= 1;
	totalPages 	= 1;
	private readonly pageSize = 20;

	detailOpen 		= false;
	detailLoading = false;
	detail: TmdbMovieDetail | null = null;

	constructor(public tmdb: TmdbService, private favs: FavoritesService) {
		addIcons({ closeOutline, star, starOutline });
	}

	ngOnInit() {
		this.favs.favorites$.subscribe((list) => {
			this.allFavorites = list;
			this.page = 1;
			this.updatePage();
		});
	}

	private updatePage() {
		const all 			= this.allFavorites || [];
		const total 		= Math.max(1, Math.ceil(all.length / this.pageSize));
		this.totalPages = total || 1;

		if (this.page > total) 
			this.page = total || 1;
		
		if (this.page < 1) 
			this.page = 1;

		const start = (this.page - 1) * this.pageSize;
		const end = start + this.pageSize;
		this.favorites = all.slice(start, end);
	}

	poster(movie: TmdbMovie) {
		return this.tmdb.img(movie.poster_path);
	}

	openDetail(movie: TmdbMovie) {
		this.detailOpen 		= true;
		this.detailLoading 	= true;
		this.detail 				= null;

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
		this.detail 		= null;
	}

	getDirectors(detail: TmdbMovieDetail | null): string {
		if (!detail || !detail.credits || !detail.credits.crew) return "Unknown";
		const names = detail.credits.crew.filter((c) => c.job === "Director").map((c) => c.name);
		return names.length ? names.join(", ") : "Unknown";
	}

	isFavorite(movie: TmdbMovie | TmdbMovieDetail | null | undefined): boolean {
		if (!movie) return false;
		return this.favs.isFavorite(movie.id);
	}

	toggleFavorite(movie: TmdbMovie | TmdbMovieDetail | null | undefined, ev?: Event) {
		if (ev) 
			ev.stopPropagation();
		if (!movie) 
			return;

		this.favs.toggle(movie);
	}

	nextPage() {
		if (this.page >= this.totalPages) 
			return;

		this.page++;
		this.updatePage();
	}

	prevPage() {
		if (this.page <= 1) 
			return;

		this.page--;
		this.updatePage();
	}
}
