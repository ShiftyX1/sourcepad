export enum Theme {
    DARK = 'dark',
    LIGHT = 'light'
}

export interface ThemeConfig {
    name: string;
    displayName: string;
    icon: string;
}

export const THEMES: Record<Theme, ThemeConfig> = {
    [Theme.DARK]: {
        name: 'dark',
        displayName: 'Темная',
        icon: '🌙'
    },
    [Theme.LIGHT]: {
        name: 'light',
        displayName: 'Светлая',
        icon: '☀️'
    }
};

export class ThemeManager {
    private static instance: ThemeManager;
    private currentTheme: Theme = Theme.DARK;
    private observers: ((theme: Theme) => void)[] = [];

    private constructor() {
        this.loadTheme();
        this.applyTheme(this.currentTheme);
    }

    static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    getCurrentTheme(): Theme {
        return this.currentTheme;
    }

    setTheme(theme: Theme): void {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
        this.notifyObservers(theme);
    }

    toggleTheme(): void {
        const newTheme = this.currentTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
        this.setTheme(newTheme);
    }

    subscribe(callback: (theme: Theme) => void): () => void {
        this.observers.push(callback);
        return () => {
            const index = this.observers.indexOf(callback);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        };
    }

    private applyTheme(theme: Theme): void {
        document.documentElement.setAttribute('data-theme', theme);
    }

    private saveTheme(theme: Theme): void {
        localStorage.setItem('sourcepad-theme', theme);
    }

    private loadTheme(): void {
        const savedTheme = localStorage.getItem('sourcepad-theme') as Theme;
        if (savedTheme && Object.values(Theme).includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? Theme.DARK : Theme.LIGHT;
        }
    }

    private notifyObservers(theme: Theme): void {
        this.observers.forEach(callback => callback(theme));
    }

    getMonacoTheme(): string {
        return this.currentTheme === Theme.DARK ? 'sourcepad-dark' : 'sourcepad-light';
    }
}

export const themeManager = ThemeManager.getInstance();
