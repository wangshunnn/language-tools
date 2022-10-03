import type { DocumentServiceRuntimeContext } from '../types';
import { documentFeatureWorker } from '../utils/featureWorkers';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { transformSymbolInformations } from '@volar/transforms';
import * as vscode from 'vscode-languageserver-protocol';

export function register(context: DocumentServiceRuntimeContext) {

	return (document: TextDocument) => {

		return documentFeatureWorker(
			context,
			document,
			sourceMap => !!sourceMap.embeddedFile.capabilities.documentSymbol, // TODO: add color capabilitie setting
			(plugin, document) => plugin.findDocumentSymbols?.(document),
			(data, sourceMap) => transformSymbolInformations(
				data,
				location => {
					const range = sourceMap.toSourceRange(location.range);
					if (range) {
						return vscode.Location.create(sourceMap.sourceDocument.uri, range);
					}
				},
			),
			arr => arr.flat(),
		);
	};
}