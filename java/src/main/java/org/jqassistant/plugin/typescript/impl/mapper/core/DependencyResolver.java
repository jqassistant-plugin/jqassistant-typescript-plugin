package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.core.DependsOnDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.Dependency;

import java.util.List;

public class DependencyResolver {

    public static void resolve(Scanner scanner, List<Dependency> dependencies) {
        ScannerContext context = scanner.getContext();
        FqnResolver fqnResolver = context.peek(FqnResolver.class);

        for(Dependency dep : dependencies) {
            TypeScriptDescriptor source = fqnResolver.getByFqn(dep.getSourceFQN());
            TypeScriptDescriptor target = fqnResolver.getByFqn(dep.getFqn());
            if(source != null && target != null) {
                DependsOnDescriptor relationDescriptor = context.getStore().create(source, DependsOnDescriptor.class, target);
                relationDescriptor.setCardinality(dep.getCardinality());
            }
        }

        // create missing transitive relationships
        context.getStore().executeQuery(
            "MATCH (decl:TS)-[r:DEPENDS_ON]->(trgt:TS)<-[:DECLARES*]-(trgtParent:TS) " +
            "WHERE NOT (trgtParent)-[:DECLARES*]->(decl) " +
            "CREATE (decl)-[:DEPENDS_ON {cardinality: r.cardinality}]->(trgtParent)"
        );
        context.getStore().executeQuery(
            "MATCH (srcParent:TS)-[:DECLARES*]->(decl:TS)-[r:DEPENDS_ON]->(trgt:TS) " +
            "WHERE NOT (srcParent)-[:DECLARES*]->(trgt) " +
            "CREATE (srcParent)-[:DEPENDS_ON {cardinality: r.cardinality}]->(trgt)"
        );

        // aggregate relationships
        context.getStore().executeQuery(
            "MATCH (src:TS)-[r:DEPENDS_ON]->(trgt:TS) " +
            "WITH src, trgt, collect(r) AS rels, sum(r.cardinality) AS new_cardinality " +
            "WHERE size(rels) > 1 " +
            "SET (rels[0]).cardinality = new_cardinality " +
            "WITH src, trgt, rels, new_cardinality " +
            "UNWIND range(1,size(rels)-1) AS idx " +
            "DELETE rels[idx]"
        );

        // remove self-referencing relationships
        context.getStore().executeQuery(
            "MATCH (src:TS)-[r:DEPENDS_ON]->(src:TS) " +
            "DELETE r"
        );
    }

}
