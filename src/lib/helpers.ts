import type { Page } from '@sveltejs/kit';

export function getShortNames(name: string) {
	const a = name.split(' ');
	return a[0][0].toLocaleUpperCase() + (a[1][0].toLocaleUpperCase() ?? '');
}