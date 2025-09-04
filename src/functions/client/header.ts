/**
 * 
 * @param event dark mode selection event 
 */
export const darkModeChangeEventHandler = (event: MediaQueryListEvent) => {
    if (event.matches) { document.getElementById('layoutHTML')?.classList.add("dark"); document.cookie = "theme=dark" }
    else { document.getElementById('layoutHTML')?.classList.remove("dark"); document.cookie = "theme=light" }
}

/**
 * @description add dark theme listener
 */
export const addDarkThemeListener = () => darkModeMediaQuery?.addEventListener('change', darkModeChangeEventHandler)

/**
 * @description remove dark theme listener
 */
export const removeDarkThemeListener = () => darkModeMediaQuery?.removeEventListener('change', darkModeChangeEventHandler)

/**
 * 
 */
export const detectDarkTheme = () => {

    if (typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.getElementById('layoutHTML')?.classList.add("dark")
        document.cookie = "theme=dark"
    }

    else if (typeof window !== 'undefined') {
        document.getElementById('layoutHTML')?.classList.remove("dark")
        document.cookie = "theme=light"
    }
}

// Dark Theme Query
export const darkModeMediaQuery = typeof window !== 'undefined' ? window.matchMedia("(prefers-color-scheme: dark)") : undefined