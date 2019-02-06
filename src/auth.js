import {SchemaDirectiveVisitor, AuthenticationError} from 'apollo-server';

export default class Auth extends SchemaDirectiveVisitor {
    visitFieldDefinition(field){
        const ogResolver = field.resolver

        field.resolve = async function(_, args, ctx, info) {
            if(!ctx.req.user) {
                throw new AuthenticationError('fail!')
            }
            return ogResolver.call(this, _, args, ctx, info)
        }
    }
}