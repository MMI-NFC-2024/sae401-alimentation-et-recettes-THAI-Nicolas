/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Avis = "avis",
	Composition = "composition",
	Etapes = "etapes",
	Ingredients = "ingredients",
	Recettes = "recettes",
	Regimes = "regimes",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type AvisRecord = {
	commentaire?: HTMLString
	created: IsoAutoDateString
	id: string
	note?: number
	recette?: RecordIdString
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum CompositionUniteOptions {
	"g" = "g",
	"kg" = "kg",
	"ml" = "ml",
	"cl" = "cl",
	"L" = "L",
	"c. à soupe" = "c. à soupe",
	"c. à café" = "c. à café",
	"pincée" = "pincée",
	"filet" = "filet",
	"pièce" = "pièce",
	"tranche" = "tranche",
	"feuille" = "feuille",
	"sachet" = "sachet",
	"bol" = "bol",
	"cm" = "cm",
	"gousse" = "gousse",
}
export type CompositionRecord = {
	created: IsoAutoDateString
	id: string
	ingredient?: RecordIdString
	quantite?: number
	recette?: RecordIdString
	unite?: CompositionUniteOptions
	updated: IsoAutoDateString
}

export type EtapesRecord = {
	created: IsoAutoDateString
	description?: HTMLString
	id: string
	numero_ordre?: number
	recette?: RecordIdString
	titre?: string
	updated: IsoAutoDateString
}

export type IngredientsRecord = {
	created: IsoAutoDateString
	glucides_100g?: number
	id: string
	kcal_100g?: number
	lipides_100g?: number
	nom?: string
	proteines_100g?: number
	updated: IsoAutoDateString
}

export enum RecettesDifficulteOptions {
	"facile" = "facile",
	"moyen" = "moyen",
	"difficile" = "difficile",
}

export enum RecettesCategorieOptions {
	"Entrée" = "Entrée",
	"Plat" = "Plat",
	"Dessert" = "Dessert",
	"Boisson" = "Boisson",
}

export enum RecettesObjectifSanteOptions {
	"Prise de masse" = "Prise de masse",
	"Perte de poids" = "Perte de poids",
	"Équilibre" = "Équilibre",
}
export type RecettesRecord = {
	categorie?: RecettesCategorieOptions
	conseils_chef?: HTMLString
	created: IsoAutoDateString
	description?: HTMLString
	difficulte?: RecettesDifficulteOptions
	id: string
	image?: FileNameString
	kcal_portion?: number
	objectif_sante?: RecettesObjectifSanteOptions
	portions?: number
	regimes?: RecordIdString[]
	temps_total?: number
	titre?: string
	total_glucides?: number
	total_lipides?: number
	total_proteines?: number
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type RegimesRecord = {
	created: IsoAutoDateString
	description?: HTMLString
	id: string
	nom?: string
	updated: IsoAutoDateString
}

export type UsersRecord = {
	age?: number
	avatar?: FileNameString
	bio?: string
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	favoris?: RecordIdString[]
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AvisResponse<Texpand = unknown> = Required<AvisRecord> & BaseSystemFields<Texpand>
export type CompositionResponse<Texpand = unknown> = Required<CompositionRecord> & BaseSystemFields<Texpand>
export type EtapesResponse<Texpand = unknown> = Required<EtapesRecord> & BaseSystemFields<Texpand>
export type IngredientsResponse<Texpand = unknown> = Required<IngredientsRecord> & BaseSystemFields<Texpand>
export type RecettesResponse<Texpand = unknown> = Required<RecettesRecord> & BaseSystemFields<Texpand>
export type RegimesResponse<Texpand = unknown> = Required<RegimesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	avis: AvisRecord
	composition: CompositionRecord
	etapes: EtapesRecord
	ingredients: IngredientsRecord
	recettes: RecettesRecord
	regimes: RegimesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	avis: AvisResponse
	composition: CompositionResponse
	etapes: EtapesResponse
	ingredients: IngredientsResponse
	recettes: RecettesResponse
	regimes: RegimesResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
