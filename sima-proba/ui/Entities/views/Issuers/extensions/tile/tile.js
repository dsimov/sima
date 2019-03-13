/*
 * Copyright (c) 2017 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 * Contributors:
 * SAP - initial API and implementation
 */

var dao = require('sima-proba/data/dao/Entities/Issuers.js')

exports.getTile = function(relativePath) {
	return {
		'name': 'Issuer',
		'group': 'Entities',
		'icon': 'file-o',
		'location': relativePath + 'services/v3/web/sima-proba/ui/Entities/index.html',
		'count': dao.customDataCount(),
		'order': '100'
	};
};
