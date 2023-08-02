package org.jqassistant.plugin.typescript.impl.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = TypePrimitive.class, name = "primitive"),
    @JsonSubTypes.Type(value = TypeDeclared.class, name = "declared"),
    @JsonSubTypes.Type(value = TypeUnion.class, name = "union"),
    @JsonSubTypes.Type(value = TypeIntersection.class, name = "intersection"),
    @JsonSubTypes.Type(value = TypeObject.class, name = "object"),
    @JsonSubTypes.Type(value = TypeFunction.class, name = "function"),
    @JsonSubTypes.Type(value = TypeParameter.class, name = "type-parameter"),
    @JsonSubTypes.Type(value = TypeLiteral.class, name = "literal"),
    @JsonSubTypes.Type(value = TypeTuple.class, name = "tuple"),
    @JsonSubTypes.Type(value = TypeNotIdentified.class, name = "not-identified")
})
public abstract class Type {
}
