#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Form methods to add to action files
const formMethods = {
  'App/Http/Controllers/Settings/ProfileController.ts': [
    {
      method: 'update',
      httpMethod: 'patch',
      route: '/settings/profile',
      controllerMethod: 'update',
      phpFile: 'app/Http/Controllers/Settings/ProfileController.php:30'
    },
    {
      method: 'destroy',
      httpMethod: 'delete',
      route: '/settings/profile',
      controllerMethod: 'destroy',
      phpFile: 'app/Http/Controllers/Settings/ProfileController.php:49'
    }
  ],
  'App/Http/Controllers/Settings/PasswordController.ts': [
    {
      method: 'update',
      httpMethod: 'put',
      route: '/settings/password',
      controllerMethod: 'update',
      phpFile: 'app/Http/Controllers/Settings/PasswordController.php:26'
    }
  ],
  'App/Http/Controllers/Auth/AuthenticatedSessionController.ts': [
    {
      method: 'store',
      httpMethod: 'post',
      route: '/login',
      controllerMethod: 'store',
      phpFile: 'app/Http/Controllers/Auth/AuthenticatedSessionController.php:30'
    }
  ],
  'App/Http/Controllers/Auth/ConfirmablePasswordController.ts': [
    {
      method: 'store',
      httpMethod: 'post',
      route: '/confirm-password',
      controllerMethod: 'store',
      phpFile: 'app/Http/Controllers/Auth/ConfirmablePasswordController.php:26'
    }
  ],
  'App/Http/Controllers/Auth/EmailVerificationNotificationController.ts': [
    {
      method: 'store',
      httpMethod: 'post',
      route: '/email/verification-notification',
      controllerMethod: 'store',
      phpFile: 'app/Http/Controllers/Auth/EmailVerificationNotificationController.php:14'
    }
  ],
  'App/Http/Controllers/Auth/NewPasswordController.ts': [
    {
      method: 'store',
      httpMethod: 'post',
      route: '/reset-password',
      controllerMethod: 'store',
      phpFile: 'app/Http/Controllers/Auth/NewPasswordController.php:36'
    }
  ],
  'App/Http/Controllers/Auth/PasswordResetLinkController.ts': [
    {
      method: 'store',
      httpMethod: 'post',
      route: '/forgot-password',
      controllerMethod: 'store',
      phpFile: 'app/Http/Controllers/Auth/PasswordResetLinkController.php:29'
    }
  ],
  'App/Http/Controllers/Auth/RegisteredUserController.ts': [
    {
      method: 'store',
      httpMethod: 'post',
      route: '/register',
      controllerMethod: 'store',
      phpFile: 'app/Http/Controllers/Auth/RegisteredUserController.php:31'
    }
  ]
};

function addFormMethod(filePath, method) {
  const fullPath = path.join('resources/js/actions', filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Add RouteFormDefinition to imports
  if (!content.includes('type RouteFormDefinition')) {
    content = content.replace(
      /import \{ queryParams, type RouteQueryOptions, type RouteDefinition(.*?) \}/,
      'import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition$1 }'
    );
  }

  // Check if form method already exists
  const formMethodPattern = new RegExp(`${method.method}\\.form\\s*=`);
  if (formMethodPattern.test(content)) {
    console.log(`Form method already exists in ${filePath} for ${method.method}`);
    return;
  }

  // Find the position to insert form method (after the last method definition)
  const methodPattern = new RegExp(`${method.method}\\.(${method.httpMethod})\\s*=\\s*\\([^}]+\\}\\)`, 'g');
  const matches = Array.from(content.matchAll(methodPattern));

  if (matches.length === 0) {
    console.warn(`Could not find ${method.method}.${method.httpMethod} method in ${filePath}`);
    return;
  }

  const lastMatch = matches[matches.length - 1];
  const insertPosition = lastMatch.index + lastMatch[0].length;

  const formMethodCode = `

/**
* @see \\App\\Http\\Controllers\\${filePath.replace('/ts', '').replace('/', '\\')}::${method.controllerMethod}
* @see ${method.phpFile}
* @route '${method.route}'
*/
${method.method}.form = (): RouteFormDefinition<'${method.httpMethod}'> => ({
    action: ${method.method}.definition.url,
    method: '${method.httpMethod}',
})`;

  const newContent = content.slice(0, insertPosition) + formMethodCode + content.slice(insertPosition);

  fs.writeFileSync(fullPath, newContent);
  console.log(`Added form method to ${filePath} for ${method.method}`);
}

function main() {
  console.log('Extending Wayfinder generated files with form methods...');

  for (const [filePath, methods] of Object.entries(formMethods)) {
    for (const method of methods) {
      addFormMethod(filePath, method);
    }
  }

  console.log('Wayfinder extension completed!');
}

if (require.main === module) {
  main();
}