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
} from "@ionic/angular/standalone";
import { TmdbService, TmdbMovie } from "../services/tmdb.service";

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
	],
})
export class Tab1Page implements OnInit {
	movies: TmdbMovie[] = [];
	loading = false;
	errorMessage: string | null = null;

	constructor(private tmdb: TmdbService) {}

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
}
