/**
 * Character Schema and type definitions
 * 
 * Uses Valibot for validation of name and lastName fields.
 */
import { minLength, object, pipe, string, type InferInput } from "valibot";

/**
 * CharacterSchema validates the required fields for a Character.
 * - `name` must be a string with a minimum length of 6.
 * - `lastName` must be a string with a minimum length of 6.
 */
export const CharacterSchema = object({
  name: pipe(string(), minLength(6)),
  lastName: pipe(string(), minLength(6)),
});

/**
 * Character type extends the validated schema with an `id` property.
 */
export type Character = InferInput<typeof CharacterSchema> & {
  id: number;
};

/**
 * In-memory data store for `Character` entities, keyed by their `id`.
 */
const characters: Map<number, Character> = new Map();

/**
 * Retrieves all characters from the in-memory store.
 *
 * @returns A promise that resolves to an array of all stored characters.
 */
export const getAllCharacters = async (): Promise<Character[]> => {
  return Array.from(characters.values());
};

/**
 * Retrieves a character by its `id`.
 *
 * @param id - The ID of the character to retrieve.
 * @returns A promise that resolves to the character if found, or `undefined` otherwise.
 */
export const getCharacterById = async (
  id: number
): Promise<Character | undefined> => {
  return characters.get(id);
};

/**
 * Adds a new character to the in-memory store.
 *
 * @param name - The name of the character (must be at least 6 characters).
 * @param lastName - The last name of the character (must be at least 6 characters).
 * @returns A promise that resolves to the newly created `Character`.
 */
export const addCharacter = async (
  character: Character
): Promise<Character> => {
  if(!characters.has(character.id)){
    console.error(`Character with id ${character.id} already exists`);
    return character;
  }
  const newCharacter = {
    ...character,
    id: new Date().getTime(),
  };

  characters.set(newCharacter.id, newCharacter);

  return newCharacter;
};

/**
 * Updates an existing character in the in-memory store.
 *
 * @param id - The ID of the character to update.
 * @param updatedCharacter - The new character data to replace the existing one.
 * @returns A promise that resolves to the updated character, or `null` if no character was found with the given ID.
 */
export const updateCharacter = async (
  id: number,
  updatedCharacter: Character
): Promise<Character | null> => {
  if (!characters.has(id)) {
    console.error(`Character with id ${id} not found`);
    return null;
  }

  characters.set(id, updatedCharacter);

  return updatedCharacter;
};

/**
 * Deletes an existing character from the in-memory store.
 *
 * @param id - The ID of the character to delete.
 * @returns A promise that resolves to `true` if the character was successfully deleted, or `false` if the character was not found.
 */
export const deleteCharacter = async (id: number): Promise<boolean> => {
  if (!characters.has(id)) {
    console.error(`Character with id ${id} not found`);
    return false;
  }

  characters
  .delete(id);
  return true;
};
