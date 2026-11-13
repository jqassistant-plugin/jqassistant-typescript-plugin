package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import lombok.extern.slf4j.Slf4j;
import org.jqassistant.plugin.typescript.api.model.core.DependsOnDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.Dependency;

import java.util.List;

@Slf4j
public class DependencyResolver {

    public static void resolve(Scanner scanner, List<Dependency> dependencies) {
        ScannerContext context = scanner.getContext();
        FqnResolver fqnResolver = context.peek(FqnResolver.class);

        int unresolvedDependencies = 0;
        for(Dependency dep : dependencies) {
            TypeScriptDescriptor source = fqnResolver.getByGlobalFqn(dep.getGlobalSourceFQN());
            TypeScriptDescriptor target = fqnResolver.getByGlobalFqn(dep.getGlobalFqn());
            if(source != null && target != null) {
                DependsOnDescriptor relationDescriptor = context.getStore().create(source, DependsOnDescriptor.class, target);
                relationDescriptor.setCardinality(dep.getCardinality());
            } else {
                unresolvedDependencies++;
                log.debug("Skipping dependency {} -> {}: {} not found", dep.getGlobalSourceFQN(), dep.getGlobalFqn(), source == null ? "source" : "target");
            }
        }
        if(unresolvedDependencies > 0) {
            log.info("Skipped {} of {} dependencies whose source or target could not be found (details on debug level)", unresolvedDependencies, dependencies.size());
        }

        // create missing transitive relationships
        context.getStore().executeQuery(
            "MATCH (decl:TS)-[r:DEPENDS_ON]->(trgt:TS)<-[:DECLARES|EXPORTS*]-(trgtParent:TS) " +
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
