import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TmdbMovie } from "./tmdb.service";

const STORAGE_KEY = "favoriteMovies";

@Injectable({ providedIn: "root" })
export class FavoritesService {
	private favoritesMap 			= new Map<number, TmdbMovie>();
	private favoritesSubject 	= new BehaviorSubject<TmdbMovie[]>([]);

	favorites$ = this.favoritesSubject.asObservable();

	constructor() {
		this.loadFromStorage();
	}

	private loadFromStorage() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);

			if (!raw) 
				return;

			const arr: TmdbMovie[] = JSON.parse(raw);
			this.favoritesMap = new Map(arr.map((m) => [m.id, m]));
			this.emit();
		} catch (e) {
			console.error("Failed to load favorites:", e);
		}
	}

	private saveToStorage() {
		const arr = Array.from(this.favoritesMap.values());
		localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
		this.emit();
	}

	private emit() {
		this.favoritesSubject.next(Array.from(this.favoritesMap.values()));
	}

	isFavorite(id: number | null | undefined): boolean {
		if (id == null) 
			return false;

		return this.favoritesMap.has(id);
	}

	toggle(movie: TmdbMovie | null | undefined) {
		if (!movie) 
			return;

		if (this.favoritesMap.has(movie.id)) {
			this.favoritesMap.delete(movie.id);
		} 
		else {
			this.favoritesMap.set(movie.id, {
				id: movie.id,
				title: movie.title,
				overview: movie.overview,
				poster_path: movie.poster_path,
				release_date: movie.release_date,
				vote_average: movie.vote_average,
			});
		}
		this.saveToStorage();
	}

	getAll(): TmdbMovie[] {
		return Array.from(this.favoritesMap.values());
	}
}
