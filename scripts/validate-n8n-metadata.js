const assert = require('assert');
const { readFileSync } = require('fs');
const { join } = require('path');

const nodeSource = readFileSync(join(__dirname, '..', 'nodes', 'Postora', 'Postora2.node.ts'), 'utf8');

function getStringProperty(source, propertyName) {
	const match = source.match(new RegExp(`${propertyName}:\\s*'([^']+)'`));
	assert(match, `Could not find ${propertyName} in Postora2 node description`);
	return match[1];
}

const displayName = getStringProperty(nodeSource, 'displayName');
const defaultNameMatch = nodeSource.match(/defaults:\s*{\s*name:\s*'([^']+)'/m);
assert(defaultNameMatch, 'Could not find defaults.name in Postora2 node description');
const expectedVisibleName = 'Postora.W.M';

assert.strictEqual(
	displayName,
	expectedVisibleName,
	`displayName must be ${expectedVisibleName} for n8n-nodes-postora-2`,
);
assert.strictEqual(
	defaultNameMatch[1],
	expectedVisibleName,
	`defaults.name must be ${expectedVisibleName} for n8n-nodes-postora-2`,
);
assert.notStrictEqual(
	displayName,
	'Postora',
	'n8n stores installed_nodes.name from the visible node name; Postora collides with n8n-nodes-postora',
);
assert.notStrictEqual(
	defaultNameMatch[1],
	'Postora',
	'defaults.name must not collide with n8n-nodes-postora',
);

console.log('n8n metadata is unique for n8n-nodes-postora-2');
