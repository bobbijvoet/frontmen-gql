import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server';

export default class Auth extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const ogResolve = field.resolve;

    field.resolve = async function(_, args, ctx, info) {
      if (!ctx.auth.isAuth) {
        throw new AuthenticationError('not authenticated !');
      }
      return ogResolve.call(this, _, args, ctx, info);
    };
  }
}
